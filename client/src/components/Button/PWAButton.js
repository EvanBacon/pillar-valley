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

function isPWA() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function canInstallPWA() {
  // Can't install a PWA in a native app or in a PWA
  if (Platform.OS !== "web" || isPWA()) {
    return false;
  }
  return !!window.deferredPWAInstallPrompt;
}

/**
 * This button recommends the PWA if possible.
 */
function PWAButton(props) {
  const [isInstalled, setInstalled] = React.useState(false);

  const onPress = React.useCallback(() => {
    if (window.deferredPWAInstallPrompt) {
      window.deferredPWAInstallPrompt.prompt();
      // Wait for the user to respond to the prompt
      window.deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          setInstalled(true);
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    }
  }, [setInstalled]);

  if (isInstalled) {
    return null;
  }
  // TODO(Bacon): Maybe a better icon
  return <Icon {...props} onPress={onPress} name={"download"} />;
}

export default PWAButton;
