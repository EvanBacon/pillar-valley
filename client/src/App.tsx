import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Analytics from "expo-firebase-analytics";
import * as Font from "expo-font";
import React from "react";
import { StatusBar, Platform } from "react-native";
import * as SplashScreen from 'expo-splash-screen';

import AudioManager from "./AudioManager";
import Fire from "./ExpoParty/Fire";
import Gate from "./rematch/Gate";
// import { setTestDeviceIDAsync } from "expo-ads-admob";
import * as Device from 'expo-device';
import Navigation from "./Navigation";

if (Platform.OS !== "web") {
  if (!Device.isDevice) {
    // Disable ads in the emulator / simulator
    // https://docs.expo.io/versions/latest/sdk/admob/#settestdeviceidasynctestdeviceid
    // setTestDeviceIDAsync("EMULATOR");
  }
}

// @ts-ignore
const getNow = global.nativePerformanceNow ?? Date.now;

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();


export default function App() {
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
            "GothamNarrow-Book": require("./assets/fonts/GothamNarrow-Book.ttf"),
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

      await SplashScreen.hideAsync();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Gate>
      <ActionSheetProvider>
        <Navigation />
      </ActionSheetProvider>
    </Gate>
  );
}
