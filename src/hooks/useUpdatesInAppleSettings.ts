import * as Updates from "expo-updates";
import React from "react";
import { Settings } from "react-native";

import { UPDATES_API_KEYS } from "@/src/apple-settings-x/shared";

function displayDate() {
  return new Date().toLocaleString("en-US", {
    timeZoneName: "short",
  });
}

export function useUpdatedUpdatesInfoInSettings() {
  Updates.useUpdateEvents((event) => {
    Settings.set({
      p_exupdates_live_type: event.type,
      p_exupdates_live_message: event.message ?? "",
      p_exupdates_live__updatedAt: displayDate(),
    });
  });

  React.useEffect(() => {
    Settings.set(
      UPDATES_API_KEYS.reduce<Record<string, string>>(
        (acc, { setting, key }) => {
          // @ts-expect-error
          const v = Updates[key];

          acc[setting] = typeof v === "boolean" ? (v ? "✓" : "×") : String(v);
          return acc;
        },
        {}
      )
    );

    Settings.set({
      p_exupdates__updatedAt: displayDate(),
    });
  }, []);
}
