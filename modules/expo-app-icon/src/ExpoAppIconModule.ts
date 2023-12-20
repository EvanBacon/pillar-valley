import Constants, { ExecutionEnvironment } from "expo-constants";
import { requireNativeModule } from "expo-modules-core";

if (Constants.executionEnvironment === ExecutionEnvironment.Bare) {
  // It loads the native module object from the JSI or falls back to
  // the bridge module (from NativeModulesProxy) if the remote debugger is on.
  module.exports = requireNativeModule("ExpoAppIcon") as {
    isSupported: boolean;
    /** Pass `null` to use the default icon. */
    setAlternateIcon: (iconName: string | null) => Promise<string | null>;
    /** @returns `null` if the default icon is being used. */
    getAlternateIcon: () => Promise<string | null>;
  };
} else {
  module.exports = require("./ExpoAppIconModule.web");
}
