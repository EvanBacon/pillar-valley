import { requireNativeModule } from "expo-modules-core";

export interface NativeModule {
  // Functions
  setAlternateIcon(name: string | null): Promise<unknown>;
  getAlternateIcon(): string | null;

  // Constants
  isSupported: unknown /* "UIApplication.shared.supportsAlternateIcons" */;

  // Properties


}

export default requireNativeModule("ExpoAppIcon") as NativeModule;
