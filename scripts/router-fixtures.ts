import { ExpoConfig } from "@expo/config";
import * as babel from "@babel/core";
import { getConfig } from "@expo/config";
import fs from "fs";
import path from "path";
import prettier from "prettier";
import chalk from "chalk";

// Used to emulate a context module, but way faster. TODO: May need to adjust the extensions to stay in sync with Metro.
export function getRoutePaths(cwd: string) {
  return globSync("**/*.@(ts|tsx|js|jsx)", {
    cwd,
    dot: true,
  }).map((p) => "./" + normalizePaths(p));
}

function normalizePaths(p: string) {
  return p.replace(/\\/g, "/");
}

import { sync as globSync } from "glob";

export function getRouterDirectoryModuleIdWithManifest(
  projectRoot: string,
  exp: ExpoConfig
): string {
  return exp.extra?.router?.root ?? getRouterDirectory(projectRoot);
}

let hasWarnedAboutSrcDir = false;
const logSrcDir = () => {
  if (hasWarnedAboutSrcDir) return;
  hasWarnedAboutSrcDir = true;
  console.log(
    chalk.gray("Using src/app as the root directory for Expo Router.")
  );
};

export function getRouterDirectory(projectRoot: string): string {
  // more specific directories first
  if (fs.existsSync(path.join(projectRoot, "src/app"))) {
    logSrcDir();
    return "src/app";
  }

  console.log("Using app as the root directory for Expo Router.");
  return "app";
}

export function removeSupportedExtensions(name: string): string {
  return name.replace(/(\+api)?\.[jt]sx?$/g, "");
}

// Remove any amount of `./` and `../` from the start of the string
export function removeFileSystemDots(filePath: string): string {
  return filePath.replace(/^(?:\.\.?\/)+/g, "");
}

export function getRouterFixtureFromProject(projectRoot: string) {
  const appDir = path.join(projectRoot, getRouterDirectory(projectRoot));
  //   const { exp } = getConfig(projectRoot);
  //   const appDir = getRouterDirectoryModuleIdWithManifest(projectRoot, exp);

  const routePaths = getRoutePaths(appDir)
    .filter((routePath) => {
      return (
        !routePath.match(/^\.\/\+native-intent/) &&
        !routePath.match(/^\.\/\+html/) &&
        !routePath.match(/\+api\.[jt]sx?$/)
      );
    })
    .sort();

  console.log(routePaths);

  // Convert route paths to a list of public URLs
  const results = routePaths
    .map((page) => {
      const p = (
        "/" +
        page
          .replace(/^\.\//, "")
          .replace(/(\+api)?\.[jt]sx?$/g, "")
          .split("/")
          .filter((segment) => !segment.match(/\(.*\)/))
          .join("/")
      ).replace(/\/index$/, "");

      return p || "/";
    })
    .filter((page) => !page.endsWith("_layout"));

  return results;
}

// getRouterFixtureFromProject(process.cwd())
//   .then(console.log)
//   .catch(console.error);
