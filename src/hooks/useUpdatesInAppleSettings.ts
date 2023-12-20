import * as Application from "expo-application";
// import * as Updates from "expo-updates";
import React from "react";

import { UPDATES_API_KEYS } from "@/apple-settings-x/shared";
import { Settings } from "@/lib/Settings";

function displayDate() {
  return new Date().toLocaleString("en-US", {
    timeZoneName: "short",
  });
}

export function useUpdatedUpdatesInfoInSettings() {
  // Updates.useUpdateEvents((event) => {
  //   Settings.set({
  //     p_exupdates_live_type: event.type,
  //     p_exupdates_live_message: event.message ?? "",
  //     p_exupdates_live__updatedAt: displayDate(),
  //   });
  // });

  React.useEffect(() => {
    Settings.set({
      // Follows format from Keynote and other Apple apps
      p_app_version: `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`,
    });

    // Settings.set(
    //   UPDATES_API_KEYS.reduce<Record<string, string>>(
    //     (acc, { setting, key }) => {
    //       // @ts-expect-error
    //       const v = Updates[key];

    //       acc[setting] = typeof v === "boolean" ? (v ? "✓" : "×") : String(v);
    //       return acc;
    //     },
    //     {}
    //   )
    // );

    Settings.set({
      p_exupdates__updatedAt: displayDate(),
    });
  }, []);
}
