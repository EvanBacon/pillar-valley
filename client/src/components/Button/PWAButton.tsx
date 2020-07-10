import { Platform } from "@unimodules/core";
import * as React from "react";

import Icon from "./Icon";

function isPWA() {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function usePWAInstallable() {
  const [canInstall, setCanInstall] = React.useState(canInstallPWA());

  React.useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || isPWA())
      return;

    // https://web.dev/customize-install/
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      window.deferredPWAInstallPrompt = e;
      setCanInstall(true);
    });
  }, []);

  return canInstall;
}

function canInstallPWA() {
  // Can't install a PWA in a native app or in a PWA
  if (Platform.OS !== "web" || isPWA()) {
    return false;
  }
  return !!window.deferredPWAInstallPrompt;
}

/**
 * This button recommends the PWA if possible.
 * To delete PWAs go to - chrome://apps
 */
function PWAButton({ onInstall, ...props }) {
  const onPress = React.useCallback(() => {
    if (window.deferredPWAInstallPrompt) {
      window.deferredPWAInstallPrompt.prompt();
      // Wait for the user to respond to the prompt
      window.deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          onInstall(true);
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    }
  }, []);

  // TODO(Bacon): Maybe a better icon
  return <Icon {...props} onPress={onPress} name={"download"} />;
}

export default PWAButton;
