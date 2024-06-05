const { execSync } = require("child_process");

export const KNOWN_SIZES = [
  {
    width: 1290,
    height: 2796,
    name: "6.7 inches",
    idiom: "iphone",
  },
  {
    width: 1284,
    height: 2778,
    name: "6.5 inches",
    idiom: "iphone",
  },
  {
    width: 1242,
    height: 2208,
    name: "5.5 inches",
    idiom: "iphone",
  },
  //   {
  //     device:
  //       "",
  //     resolution: { width: 2064, height: 2752 },
  //     displaySize: "13 inches",
  //   },
  {
    width: 2048,
    height: 2732,
    name: "12.9 inches",
    idiom: "ipad",
  },
];

// Function to run simctl command and parse the result
function getSimulators() {
  const simulatorsList = execSync("xcrun simctl list devices --json", {
    encoding: "utf8",
  });
  const simulators = JSON.parse(simulatorsList).devices;
  const availableSimulators = [];

  for (const deviceType in simulators) {
    simulators[deviceType].forEach((device) => {
      if (device.isAvailable) {
        availableSimulators.push(device);
      }
    });
  }

  return availableSimulators;
}

function parseProperties(properties: string) {
  const parsedProperties = [];
  properties
    .split(/^Port:$/gm)
    .map((item) => item.trim())
    .forEach((property) => {
      const lines = Object.fromEntries(
        property
          .split("\n")
          .map((item) => {
            const match = item.trim().match(/^([^:]+):\s+(.*)/);
            return match ? [match[1], match[2]] : null;
          })
          .filter(Boolean)
      );
      parsedProperties.push(lines);
      // .filter(([key, value]) => key && value);
      //   console.log("----");
      //   console.log(lines);
      // const [key, value] = property.split(": ");
      // parsedProperties[key] = value;
    });

  return parsedProperties;
}

import fs from "fs";
import path from "path";
import os from "os";

function cacheResolutionForSimulator(
  udid: string,
  resolution: { width: number; height: number }
) {
  const cachePath = path.join(
    os.homedir(),
    ".simctl-screenshots",
    udid,
    "info.json"
  );
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(resolution));
}

function getCachedResolutionForSimulator(udid: string) {
  const cachePath = path.join(
    os.homedir(),
    ".simctl-screenshots",
    udid,
    "info.json"
  );
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }
  return null;
}

// Function to get display properties of a simulator
function getDisplayProperties(udid: string) {
  const cachedResolution = getCachedResolutionForSimulator(udid);
  if (cachedResolution) {
    return cachedResolution;
  }
  try {
    const deviceProperties = execSync(`xcrun simctl io ${udid} enumerate`, {
      encoding: "utf8",
    });
    const allProperties = parseProperties(deviceProperties)
      .filter((item) => item.Class === "Display")
      .sort((a, b) => a["Display class"] > b["Display class"]);
    const properties = allProperties[0];

    if (properties) {
      //   console.log(allProperties);
      const sizes = {
        width: parseInt(properties["Default width"]),
        height: parseInt(properties["Default height"]),
      };
      cacheResolutionForSimulator(udid, sizes);
      return sizes;
    }
    console.warn(`No display properties found for simulator: ${udid}.`);
    return null;
  } catch (error) {
    console.error(
      `Error fetching properties for simulator ${udid}: ${error.message}`
    );
  }
  return null;
}

// Function to find the best match for given dimensions
function findBestMatch(
  simulators,
  dimensions: { width: number; height: number; name: string }[]
) {
  const matches = [];

  dimensions.forEach((dimension) => {
    let bestMatch = null;
    let smallestDiff = Infinity;

    simulators.forEach((simulator) => {
      const displayProps = getDisplayProperties(simulator.udid);
      console.log(simulator);
      console.log(displayProps);
      //   process.exit(0);

      if (displayProps) {
        const diff =
          Math.abs(displayProps.width - dimension.width) +
          Math.abs(displayProps.height - dimension.height);

        if (diff < smallestDiff) {
          smallestDiff = diff;
          bestMatch = { ...simulator, displayProps };
        }
      }
    });
    // Match must be within 10% of the target resolution
    if (smallestDiff > dimension.width * 0.1) {
      bestMatch = null;
    }

    matches.push({ dimension, name: dimension.name, bestMatch });
  });

  return matches;
}

// Main function
export function getSimsForSizesAsync(
  sizes: { width: number; height: number; name: string }[]
) {
  const simulators = getSimulators();
  const matches = findBestMatch(simulators, sizes);

  const udids: { device: { udid: string; name: string }; size: string }[] = [];
  matches.forEach((match) => {
    console.log(
      `Dimension: ${match.dimension.name} | ${match.dimension.width}x${match.dimension.height}`
    );
    if (match.bestMatch) {
      udids.push({ device: match.bestMatch, size: match.name });
      console.log(
        `Best Match: ${match.bestMatch.name} (${match.bestMatch.udid}) - ${match.bestMatch.displayProps.width}x${match.bestMatch.displayProps.height}`
      );
    } else {
      console.log("No match found.");
    }

    console.log();
  });

  return udids;
}

function uniqueBy<T>(array: T[], key: keyof T) {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
