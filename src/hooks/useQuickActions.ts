import * as QuickActions from "expo-quick-actions";
import { router } from "expo-router";
import React from "react";

import { useIconName } from "@/components/DynamicIconContext";

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
  const [name] = useIconName();
  React.useEffect(() => {
    QuickActions.setItems([
      {
        id: "icon",
        title: "Change Icon",
        subtitle: name ?? "Default",
        icon: "symbol:apps.iphone",
        params: { href: "/settings/icon" },
      },
      {
        id: "achievements",
        title: "Achievements",
        icon: "symbol:trophy",
        params: { href: "/challenges" },
      },
      //   {
      //     id: "licenses",
      //     title: "Licenses",
      //     subtitle: "(This app doesn't do much)",
      //     icon: "symbol:figure.wave",
      //     params: { href: "/settings/licenses" },
      //   },
      {
        id: "feedback",
        title: "Leave Feedback",
        subtitle: "Please provide feedback before deleting the app",
        icon: "symbol:envelope",
        params: { href: "mailto:bacon@expo.dev" },
      },
    ]);
  }, []);
  useRouterQuickActions();
}

function useRouterQuickActions() {
  useQuickActionCallback((action) => {
    console.log("action", action);
    // Doing this instead of adding an extra layout to the app
    setTimeout(() => {
      if (typeof action.params?.href === "string") {
        console.log("Link to:", action.params.href);
        router.push(action.params.href);
      }
    });
  });
}
