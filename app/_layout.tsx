import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Analytics from "expo-firebase-analytics";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Font from "expo-font";
import React from "react";
import { StatusBar, Platform } from "react-native";
import AudioManager from "@/src/AudioManager";
import Fire from "@/src/ExpoParty/Fire";
import Gate from "@/src/rematch/Gate";
// import { setTestDeviceIDAsync } from "expo-ads-admob";
import * as Device from "expo-device";
import TouchableBounce from "@/src/components/TouchableBounce";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export const unstable_settings = {
  initialRouteName: "index",
};

// TODO: Customize this
export { ErrorBoundary } from "expo-router";

export default function Layout() {
  const pathname = usePathname();
  const loading = useLoadAssets();
  useEffect(() => {
    Analytics.logEvent("screen_view", { currentScreen: pathname });
  }, [pathname]);

  return (
    <>
      {loading && <SplashScreen />}

      <Gate>
        <ActionSheetProvider>
          <Stack
            screenOptions={{
              headerTintColor: "white",
              headerStyle: {
                backgroundColor: "#E07C4C",
              },
              headerTitleStyle: { color: "white" },
            }}
          >
            <Stack.Screen name="index" options={{ header: () => null }} />
            <Stack.Screen
              name="challenges"
              options={{
                title: "Challenges",
                headerRight: BackButton,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="credit"
              options={{
                title: "Licenses",
                headerRight: BackButton,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                title: "Settings",
                headerRight: BackButton,
                presentation: "modal",
              }}
            />
          </Stack>
        </ActionSheetProvider>
      </Gate>
    </>
  );
}

function BackButton() {
  const router = useRouter();
  if (Platform.OS === "web") {
    return null;
  }
  return (
    <TouchableBounce name="close" onPress={() => router.back()}>
      <FontAwesome size={24} color={"white"} name={"angle-down"} />
    </TouchableBounce>
  );
}

function useLoadAssets() {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    StatusBar.setBarStyle("light-content", true);
    Fire.init();
    (async () => {
      // console.time("Setup");
      let time = getNow();
      try {
        await Promise.all([
          Font.loadAsync({
            "GothamNarrow-Book": require("../src/assets/fonts/GothamNarrow-Book.ttf"),
          }),
          AudioManager.setupAsync(),
        ]);
      } catch (error) {
        console.log("Error loading fonts and audio!");
        Analytics.logEvent("error_loading_assets", { error });
        console.error(error);
      } finally {
        const total = getNow() - time;
        Analytics.logEvent("assets_loaded", { milliseconds: total });
        // console.timeEnd("Setup");
      }
      setLoading(false);
    })();
  }, []);
  return loading;
}

if (Platform.OS !== "web") {
  if (!Device.isDevice) {
    // Disable ads in the emulator / simulator
    // https://docs.expo.io/versions/latest/sdk/admob/#settestdeviceidasynctestdeviceid
    // setTestDeviceIDAsync("EMULATOR");
  }
}

// @ts-ignore
const getNow = global.nativePerformanceNow ?? Date.now;
