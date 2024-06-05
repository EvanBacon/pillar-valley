import plist from "@expo/plist";
import spawnAsync, { SpawnOptions } from "@expo/spawn-async";
import bplistCreator from "bplist-creator";
import binaryPlist from "bplist-parser";
import { execSync } from "child_process";
import * as fs from "fs";
import os from "os";
import * as path from "path";
import { KNOWN_SIZES, getSimsForSizesAsync } from "./getSimsForSizes";

const CHAR_CHEVRON_OPEN = 60;
const CHAR_B_LOWER = 98;
// .mobileprovision
// const CHAR_ZERO = 30;

async function parsePlistAsync(plistPath: string) {
  debug(`Parse plist: ${plistPath}`);

  return parsePlistBuffer(await fs.promises.readFile(plistPath));
}

function parsePlistBuffer(contents: Buffer) {
  if (contents[0] === CHAR_CHEVRON_OPEN) {
    const info = plist.parse(contents.toString());
    if (Array.isArray(info)) return info[0];
    return info;
  } else if (contents[0] === CHAR_B_LOWER) {
    const info = binaryPlist.parseBuffer(contents);
    if (Array.isArray(info)) return info[0];
    return info;
  } else {
    throw new Error(
      `Cannot parse plist of type byte (0x${contents[0].toString(16)})`
    );
  }
}

const debug = console.debug;

/** Rewrite the simulator permissions to allow opening deep links without needing to prompt the user first. */
async function updateSimulatorLinkingPermissionsAsync(
  device: { udid: string },
  { schemes, appId }: { schemes: string[]; appId?: string }
) {
  if (!device.udid || !appId) {
    debug(
      "Skipping deep link permissions as missing properties could not be found:",
      {
        schemes,
        appId,
        udid: device.udid,
      }
    );
    return;
  }
  debug("Rewriting simulator permissions to support deep linking:", {
    schemes,
    appId,
    udid: device.udid,
  });

  // Get the hard-coded path to the simulator's scheme approval plist file.
  const plistPath = path.join(
    os.homedir(),
    `Library/Developer/CoreSimulator/Devices`,
    device.udid,
    `data/Library/Preferences/com.apple.launchservices.schemeapproval.plist`
  );

  const plistData = fs.existsSync(plistPath)
    ? // If the file exists, then read it in the bplist format.
      await parsePlistAsync(plistPath)
    : // The file doesn't exist when we first launch the simulator, but an empty object can be used to create it (June 2024 x Xcode 15.3).
      // Can be tested by launching a new simulator or by deleting the file and relaunching the simulator.
      {};

  debug("Allowed links:", plistData);
  for (const scheme of schemes) {
    const key = `com.apple.CoreSimulator.CoreSimulatorBridge-->${scheme}`;
    // Replace any existing value for the scheme with the new appId.
    plistData[key] = appId;
    debug("Allowing deep link:", { key, appId });
  }

  try {
    const data = bplistCreator(plistData);
    // Write the updated plist back to disk
    await fs.promises.writeFile(plistPath, data);
  } catch (error: any) {
    console.warn(
      `Could not update simulator linking permissions: ${error.message}`
    );
  }
}

// [
//   { id: "251FC869-1A35-46A1-B3B2-20AE88AB2384", name: "iPhone 15 Plus" },
//   { id: "DAC5FD64-4DB3-457D-82BA-3CF5F239757A", name: "iPhone 14 Plus" },
//   {
//     id: "5103AD54-1E7A-447C-ABEB-DDF1F0A4DC81",
//     name: "iPad Pro (12.9-inch) (6th generation)",
//   },
// ];

// Function to launch the simulator
function launchSimulator(deviceId: string) {
  try {
    execSync(
      `xcrun simctl boot '${deviceId}'`,
      //   `SIMCTL_CHILD_SIMULATOR_RUNTIME_VERSION=16.4 xcrun simctl boot '${deviceId}'`,
      { stdio: "inherit" }
    );
  } catch (error: any) {
    if (error.status === 149) {
      console.log("Already booted");
      return;
    }
    throw error;
  }
}

export async function xcrunAsync(
  args: (string | undefined)[],
  options?: SpawnOptions
) {
  // try {
  return await spawnAsync("xcrun", args.filter(Boolean) as string[], options);
  // } catch (e) {

  // }
}

function resetStatusBar(id: string) {
  // TODO: Set date on iPad - "Tue Jan 9"
  // assumes only one simulator is booted
  // use Apple's magic time "9:41" - new Date('1/9/2007 09:41').toISOString()
  const cmd = `xcrun simctl status_bar "${id}" override --time ${new Date(
    "1/9/2007 09:41"
  ).toISOString()} --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularMode active --cellularBars 4`;
  console.log(cmd);
  execSync(cmd);
}

// Function to install the IPA
function installIPA(deviceId: string, ipaPath: string) {
  return xcrunAsync(["simctl", "install", deviceId, ipaPath], {
    stdio: "inherit",
  });
  //   // Assuming you have a method to install IPA on simulator
  //   execSync(`xcrun install "${deviceId}" ${ipaPath}`, {
  //     stdio: "inherit",
  //   });
}

// Function to open a URL (deep linking)
function openURL(deviceId: string, url: string) {
  execSync(`xcrun simctl openurl '${deviceId}' '${url}'`, { stdio: "inherit" });
}

// Function to take a screenshot
function takeScreenshot(deviceId: string, outputPath: string) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  execSync(`xcrun simctl io '${deviceId}' screenshot '${outputPath}'`, {
    stdio: "inherit",
  });
}

// Main function to run the process
async function runProcess(ipaPath: string, urls: string[]) {
  const infoPlist = await getInfoPlistAsync(ipaPath);

  const supportsIPad = infoPlist.UIDeviceFamily.includes(2);

  // Define the simulators and their respective device IDs
  const simulators = getSimsForSizesAsync(
    KNOWN_SIZES.filter((size) => {
      if (supportsIPad) {
        return true;
      }
      return size.idiom !== "ipad";
    })
  ).map((device) => ({
    id: device.device.udid,
    name: device.size,
  }));

  console.log("infoPlist", infoPlist);
  const bundleId = infoPlist.CFBundleIdentifier;
  console.log("Bundle ID:", bundleId);

  let allowedSchemes: string[] = [];
  if (Array.isArray(infoPlist.CFBundleURLTypes)) {
    allowedSchemes = infoPlist.CFBundleURLTypes.map(
      (type: any) => type.CFBundleURLSchemes
    ).flat();
    console.log("Schemes:", allowedSchemes);
  }

  // Assert schemes allowed:
  if (allowedSchemes.length === 0) {
    console.error("No schemes found in binary Info.plist");
    process.exit(1);
  }

  const validUrls: string[] = [];

  for (const url of urls) {
    if (url.startsWith("/")) {
      validUrls.push(allowedSchemes[0] + "://" + url.replace(/^\/+/, ""));
    } else if (!allowedSchemes.some((scheme) => url.startsWith(scheme + ":"))) {
      console.error(
        `URL ${url} does not match any allowed schemes: ${allowedSchemes.join(
          ", "
        )}`
      );
      process.exit(1);
    } else {
      validUrls.push(url);
    }
  }

  console.log("URLs:", validUrls);

  for (const simulator of simulators) {
    launchSimulator(simulator.id);
    await installIPA(simulator.id, ipaPath);

    await updateSimulatorLinkingPermissionsAsync(
      {
        udid: simulator.id,
      },
      {
        schemes: allowedSchemes,
        appId: bundleId,
      }
    );

    resetStatusBar(simulator.id);

    let i = 0;
    for (const url of validUrls) {
      // Reset the URL state
      openURL(simulator.id, allowedSchemes[0] + "://");
      openURL(simulator.id, url);

      if (i === 0) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      i++;
      // Add delay or logic to wait for content to load
      takeScreenshot(
        simulator.id,
        path.join(
          __dirname,
          "../screenshots",
          simulator.name.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
          (url.replace(/^\w+:\/\//, "").replace(/\//g, "_") || "index") + ".png"
          //   `${simulator.name}-screenshot.png`
        )
      );
    }
  }
}

async function getInfoPlistAsync(binaryPath: string): Promise<any> {
  const builtInfoPlistPath = path.join(binaryPath, "Info.plist");
  return await parsePlistAsync(builtInfoPlistPath);
}

// From: `EXPO_DEBUG=1 npx expo run:ios --configuration Release`
// /Users/evanbacon/Library/Developer/Xcode/DerivedData/PillarValley-avtqstqrqkadpuefualysygwukgh/Build/Products/Release-iphonesimulator/PillarValley.app
// Parsing command-line arguments
const ipaPath = process.argv[2];

// TODO: Get URLs from Expo Router.
// TODO: Get orientations
// TODO: Light mode / dark mode

// NOTE: Gets simulators by size automatically.
// NOTE: Filters out ipads automatically.

const urls = ["/", "/challenges", "/settings", "/settings/icon"];
// const urls = process.argv.slice(3);

runProcess(ipaPath, urls).catch((err) => console.error(err));
