import { requireNativeModule } from "expo-modules-core";

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
export default requireNativeModule("ExpoAppIcon") as {
  isSupported: boolean;
  /** Pass `null` to use the default icon. */
  setAlternateIcon: (iconName: string | null) => Promise<string | null>;
  /** @returns `null` if the default icon is being used. */
  getAlternateIcon: () => string | null;
};
