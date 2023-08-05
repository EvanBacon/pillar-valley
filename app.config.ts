import withAppleSettings, {
  ChildPane,
  Group,
  RadioGroup,
  Slider,
  Switch,
  TextField,
  Title,
  MultiValue,
} from "@config-plugins/apple-settings";
import { ConfigContext, ExpoConfig } from "expo/config";

module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  config = withAppleSettings(config as ExpoConfig, {
    // The name of the .plist file to generate. Root is the default and must be provided.
    Root: {
      // The page object is required. It will be used to generate the .plist file.
      // The contents will be converted directly to plist.
      page: {
        // The `PreferenceSpecifiers` defines the UI elements to generate.
        PreferenceSpecifiers: [
          // Child panes can be used to create nested pages.
          ChildPane({
            title: "Developer Info",
            file: "info",
          }),
          Group({
            title: "About",
            footerText: "Built by Evan Bacon 🥓\n\nPowered by Expo 𝝠",
          }),
        ],
      },
    },
    // Build-time info
    info: {
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
        ],
      },
    },
  });

  return config;
};
