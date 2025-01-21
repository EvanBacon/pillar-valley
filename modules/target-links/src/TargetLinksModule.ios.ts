import { NativeModule, requireNativeModule } from "expo";

import { TargetLinksModuleEvents } from "./TargetLinks.types";

declare class TargetLinksModule extends NativeModule<TargetLinksModuleEvents> {
  openAppClipDisplay(): void;
  isAppClip?: boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<TargetLinksModule>("TargetLinks");
