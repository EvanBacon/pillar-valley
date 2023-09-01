import {
  BaseMods,
  ConfigPlugin,
  IOSConfig,
  Mod,
  withMod,
  createRunOncePlugin,
} from "@expo/config-plugins";
import * as fs from "fs";
import * as xcodeParse from "@bacons/xcode/json";
import { XcodeProject } from "@bacons/xcode";

const customModName = "xcodeProjectBeta";

export { withXcodeProjectBeta } from "@config-plugins/apple-settings/build/base-mods/withXcparse";

// export const withXcodeProjectBeta: ConfigPlugin<Mod<XcodeProject>> = (
//   config,
//   action
// ) => {
//   return withMod(config, {
//     platform: "ios",
//     mod: customModName,
//     action,
//   });
// };

// const withXcodeProjectBetaBaseModInternal: ConfigPlugin = (config) => {
//   return BaseMods.withGeneratedBaseMods(config, {
//     platform: "ios",
//     saveToInternal: true,
//     skipEmptyMod: false,
//     providers: {
//       // Append a custom rule to supply AppDelegate header data to mods on `mods.ios.AppClipInfoPlist`
//       [customModName]: BaseMods.provider<XcodeProject>({
//         isIntrospective: true,

//         // isIntrospective: true,
//         async getFilePath({ modRequest, _internal }) {
//           // console.log("_internal", _internal.projectRoot);
//           // HACK: To keep soft-clean working, we need to read from the the project and not the template.
//           return IOSConfig.Paths.getPBXProjectPath(_internal!.projectRoot);
//           // return IOSConfig.Paths.getPBXProjectPath(modRequest.projectRoot);
//         },
//         async read(filePath) {
//           try {
//             return XcodeProject.open(filePath);
//           } catch (error: any) {
//             throw new Error(
//               `Failed to parse the Xcode project: "${filePath}". ${error.message}}`
//             );
//           }
//         },
//         async write(filePath, { modResults, modRequest: { introspect } }) {
//           if (introspect) {
//             return;
//           }
//           const contents = xcodeParse.build(modResults.toJSON());
//           if (contents.trim().length) {
//             await fs.promises.writeFile(filePath, contents);
//           }
//         },
//       }),
//     },
//   });
// };

// export const withXcodeProjectBetaBaseMod = createRunOncePlugin(
//   withXcodeProjectBetaBaseModInternal,
//   "withXcodeProjectBetaBaseMod"
// );
