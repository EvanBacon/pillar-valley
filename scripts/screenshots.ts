import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Define the simulators and their respective device IDs
const simulators = [
  // iPad mini (6th generation)
  { name: "iPad Pro (2nd Gen)", id: "2BE21987-D78C-4C56-97F3-16E9FFC0A056" },
  // iPad Pro (12.9-inch) (6th generation)
  { name: "iPad Pro (6th Gen)", id: "211D918A-9DA3-4A9F-BA65-A1B03FD495B3" },
  // iPhone 15 Pro Max
  { name: 'iPhone 6.7"', id: "8A8B76C8-7CE9-47FC-A88F-69D0C010D22B" },
  // iPhone 15
  { name: 'iPhone 6.5"', id: "B668BBCA-BD25-411E-B4DE-B6CEE1D1EBCC" },
  // iPhone SE (3rd generation)
  { name: 'iPhone 5.5"', id: "4234A59A-9840-45FF-AD9D-E4C5CB473881" },
];

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

import spawnAsync, { SpawnOptions } from "@expo/spawn-async";

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
  for (const simulator of simulators) {
    launchSimulator(simulator.id);
    await installIPA(simulator.id, ipaPath);

    resetStatusBar(simulator.id);

    let i = 0;
    for (const url of urls) {
      // Reset the URL state
      openURL(simulator.id, scheme + "/");
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

// From: `EXPO_DEBUG=1 npx expo run:ios --configuration Release`
// /Users/evanbacon/Library/Developer/Xcode/DerivedData/PillarValley-avtqstqrqkadpuefualysygwukgh/Build/Products/Release-iphonesimulator/PillarValley.app
// Parsing command-line arguments
const ipaPath = process.argv[2];
const scheme = "plrvly:/";
const urls = ["/", "/challenges", "/settings", "/settings/icon"].map(
  (pathname) => scheme + pathname
);
// const urls = process.argv.slice(3);

runProcess(ipaPath, urls).catch((err) => console.error(err));
