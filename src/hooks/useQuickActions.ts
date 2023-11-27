import * as QuickActions from "expo-quick-actions";
import { router } from "expo-router";
import React from "react";

import { logEvent } from "@/lib/Analytics";
import { icons, useDynamicAppIcon } from "@/components/DynamicIconContext";

export function useQuickActionCallback(
  callback?: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback?.(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback?.(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}

export function useDynamicQuickActions() {
  const [name] = useDynamicAppIcon();
  React.useEffect(() => {
    QuickActions.setItems([
      {
        id: "icon",
        title: "App Icon",
        subtitle: icons.find((icon) => icon.iconId === name)?.name,
        icon: "symbol:apps.iphone",
        params: { href: "/settings/icon" },
      },
      {
        id: "achievements",
        title: "Achievements",
        icon: "symbol:trophy",
        params: { href: "/challenges" },
      },
      {
        id: "licenses",
        title: "Licenses",
        // subtitle: "(This app doesn't do much)",
        icon: "symbol:checkmark.seal",
        params: { href: "/settings/licenses" },
      },
      {
        id: "feedback",
        title: "Leave Feedback",
        subtitle: "Please provide feedback before deleting the app",
        icon: "symbol:envelope",
        params: { href: "mailto:bacon@expo.dev" },
      },
    ]);
  }, [name]);

  // Perform navigation on quick action press
  useRouterQuickActions();
}

function useRouterQuickActions() {
  useQuickActionCallback((action) => {
    logEvent("quick_action", {
      action: action.id,
      title: action.title,
      subtitle: action.subtitle,
      href: action.params?.href,
    });

    // Doing this instead of adding an extra layout to the app
    setTimeout(() => {
      if (typeof action.params?.href === "string") {
        router.push(action.params.href);
      }
    });
  });
}
