import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AppLoading } from "expo";
import * as Analytics from "expo-firebase-analytics";
import * as Font from "expo-font";
import React from "react";
import { StatusBar, Platform } from "react-native";

import AudioManager from "./AudioManager";
import Fire from "./ExpoParty/Fire";
import Navigation from "./Navigation";
import Gate from "./rematch/Gate";
import Constants from "expo-constants";
import { setTestDeviceIDAsync } from "expo-ads-admob";

if (Platform.OS !== "web") {
  if (!Constants.isDevice) {
    // Disable ads in the emulator / simulator
    // https://docs.expo.io/versions/latest/sdk/admob/#settestdeviceidasynctestdeviceid
    setTestDeviceIDAsync("EMULATOR");
  }
}

// @ts-ignore
const getNow = global.nativePerformanceNow ?? Date.now;

export default function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    StatusBar.setBarStyle("light-content", true);
    Fire.init();
    (async () => {
      console.time("Setup");
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
        console.timeEnd("Setup");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <AppLoading />;

  return (
    <Gate>
      <ActionSheetProvider>
        <Navigation />
      </ActionSheetProvider>
    </Gate>
  );
}
