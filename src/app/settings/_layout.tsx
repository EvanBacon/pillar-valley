import { router, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import TouchableBounce from "@/components/TouchableBounce";
import { Slate } from "@/constants/Colors";
import { SF } from "@/components/sf-symbol";

export const unstable_settings = {
  initialRouteName: "index",
};

function BackButton() {
  if (Platform.OS === "web") {
    return null;
  }
  return (
    <TouchableBounce
      onPress={() => {
        // TODO: Fix going back multiple times when nested.
        while (router.canGoBack()) {
          router.back();
        }
      }}
    >
      <SF size={24} color="white" fallback="arrow-down" name="chevron.down" />
    </TouchableBounce>
  );
}

export default function Settings() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "#21222B",
          borderBottomWidth: 0,
        },
        headerBackTitleStyle: {
          fontFamily: "Inter_500Medium",
        },

        contentStyle: {
          backgroundColor: Slate[900],
        },
        headerTitleStyle: { color: "white", fontFamily: "Inter_500Medium" },
        headerRight: BackButton,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="icon" options={{ title: "App Icon" }} />
      <Stack.Screen name="licenses" options={{ title: "Licenses" }} />
    </Stack>
  );
}
