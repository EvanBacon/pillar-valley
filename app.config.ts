import withAppleSettings, {
  ChildPane,
  Group,
  Switch,
  Title,
} from "@config-plugins/apple-settings";
import { ConfigContext, ExpoConfig } from "expo/config";
import fs from "node:fs";
import path from "node:path";

import { UPDATES_API_KEYS } from "./src/apple-settings-x/shared";

module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  if (!config.plugins) config.plugins = [];

  config.plugins.push([
    "@config-plugins/react-native-dynamic-app-icon",
    fs
      .readdirSync(path.resolve(__dirname, "./icons/pillars"))
      .sort()
      .reduce<Record<string, { image: string }>>((acc, file) => {
        if (!file.startsWith("default.png") && file.endsWith(".png")) {
          acc[file.replace(/\.[\w]+/, "")] = {
            image: `./icons/pillars/${file}`,
          };
        }

        return acc;
      }, {}),
  ]);

  config = withAppleSettings(config as ExpoConfig, {
    // The name of the .plist file to generate. Root is the default and must be provided.
    Root: {
      // The page object is required. It will be used to generate the .plist file.
      // The contents will be converted directly to plist.
      page: {
        // The `PreferenceSpecifiers` defines the UI elements to generate.
        PreferenceSpecifiers: [
          // Child panes can be used to create nested pages.

          Switch({
            title: "Music and Sound ♫",
            key: "p_inapp_audio",
            value: true,
          }),

          Group({
            title: "About",
            footerText: "Built by Evan Bacon 🥓\nPowered by Expo 𝝠",
          }),
          Title({
            title: "Version",
            value: "",
            key: "p_app_version",
          }),
          ChildPane({
            title: "Licenses",
            file: "Licenses",
          }),
          ChildPane({
            title: "Developer Info",
            file: "Developer",
          }),
          ChildPane({
            title: "Runtime",
            file: "Runtime",
          }),
        ],
      },
    },
    // Build-time info
    Developer: {
      page: {
        PreferenceSpecifiers: [
          Title({
            title: "Bundle Identifier",
            value: config.ios?.bundleIdentifier!,
            key: "info_1_pref",
          }),
          Title({
            title: "Expo SDK",
            value: config.sdkVersion ?? "???",
            key: "info_2_pref",
          }),
          Title({
            title: "Scheme",
            value: Array.isArray(config.scheme)
              ? config.scheme.join(", ")
              : config.scheme!,
            key: "info_3_pref",
          }),
        ],
      },
    },
    Runtime: {
      page: {
        PreferenceSpecifiers: [
          Group({
            // idk but this seems like a better name than "Updates" in case it shows in search.
            title: "Runtime",
            footerText: "Based on the last successful launch of the app",
          }),
          ...UPDATES_API_KEYS.map(({ setting, name }) =>
            Title({
              title: name,
              value: "[Pending]",
              key: setting,
            })
          ),
          Title({
            title: "Updated",
            key: "p_exupdates__updatedAt",
            value: "[Pending]",
          }),
          Group({
            title: "Latest",
            footerText: "Based on the running instance of the app",
          }),
          Title({
            title: "Status",
            key: "p_exupdates_live_type",
            value: "[Pending]",
          }),
          Title({
            title: "Details",
            key: "p_exupdates_live_message",
            value: "[Pending]",
          }),
          Title({
            title: "Updated",
            key: "p_exupdates_live__updatedAt",
            value: "[Pending]",
          }),
        ],
      },
    },
    Licenses: {
      page: {
        // src/constants/Licenses.json
        PreferenceSpecifiers: [
          Group({
            title: "Licenses",
            footerText:
              "Generated by Expo Config Plugins\nhttps://docs.expo.dev/config-plugins/introduction/",
          }),
          ...Object.entries(
            require("./src/constants/Licenses.json") as Record<string, any>
          ).map(([name, info], index) =>
            Title({
              title: name,
              key: "license_" + index,
              value: info.licenses,
            })
          ),
        ],
      },
    },
  });

  return config;
};