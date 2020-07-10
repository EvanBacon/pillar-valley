import * as React from "react";

import Icon from "./Icon";

import { Platform } from "@unimodules/core";
import * as Linking from "expo-linking";

function isAndroidWeb() {
  if (Platform.OS !== "web") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("android");
}

function isAppleMobileWeb() {
  if (Platform.OS !== "web") return false;
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// https://stackoverflow.com/a/27862868
function isMacOSWeb() {
  if (Platform.OS !== "web") return false;
  return navigator.platform.includes("Mac");
}

// https://stackoverflow.com/a/27862868
function isWindowsWeb() {
  if (Platform.OS !== "web") return false;
  return navigator.platform.includes("Win");
}

const icons = {
  web: "globe",
  android: "android",
  ios: "apple",
};

export function getOtherPlatform() {
  switch (Platform.OS) {
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

function openPlatformLink(platform) {
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
      return Linking.openURL("https://pillarvalley.netlify.app");
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

export default SwapPlatformButton;
