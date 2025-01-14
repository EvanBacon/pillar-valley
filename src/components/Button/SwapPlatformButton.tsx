import * as Linking from "expo-linking";
import * as React from "react";

import Icon from "./Icon";

function isAndroidWeb() {
  if (process.env.EXPO_OS !== "web" || typeof window === "undefined")
    return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("android");
}

function isAppleMobileWeb() {
  if (process.env.EXPO_OS !== "web" || typeof window === "undefined")
    return false;
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

const icons = {
  web: "globe",
  android: "android",
  ios: "apple",
};

export function getOtherPlatform(): string | null {
  switch (process.env.EXPO_OS) {
    case "ios":
    case "android":
      return "web";
    case "web":
      if (isAppleMobileWeb()) {
        return "ios";
      } else if (isAndroidWeb()) {
        return "android";
      }
      // else if (isMacOSWeb()) {
      //     return 'apple';
      // } else if (isWindowsWeb()) {
      //     return 'windows';
      // }
      return null;

    default:
      return null;
  }
}

function openPlatformLink(platform: string | null) {
  switch (platform) {
    case "android":
      return Linking.openURL(
        "https://play.google.com/store/apps/details?id=com.evanbacon.pillarvalley"
      );
    case "ios":
      return Linking.openURL(
        "https://itunes.apple.com/us/app/pillar-valley/id1336398804?ls=1&mt=8"
      );
    case "web":
      return Linking.openURL("https://pillarvalley.expo.app");
    default:
      throw new Error("unsupported platform " + platform);
  }
}

export function openOtherPlatform() {
  openPlatformLink(getOtherPlatform());
}

/**
 * This button recommends the other available platform on the device.
 * iOS -> website
 * Android -> website
 * Desktop Web -> Electron app - todo
 * Mobile Safari -> iOS app
 * Mobile Android -> Android app
 */
const SwapPlatformButton = React.forwardRef((props, ref) => {
  const platform = React.useMemo(() => getOtherPlatform(), []);

  const onPress = React.useCallback(() => {
    openPlatformLink(platform);
  }, [platform]);

  return <Icon {...props} onPress={onPress} ref={ref} name={icons[platform]} />;
});

SwapPlatformButton.displayName = "SwapPlatformButton";

export default SwapPlatformButton;
