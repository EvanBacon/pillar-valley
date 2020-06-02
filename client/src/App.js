import { AppLoading } from "expo";
import AssetUtils from "expo-asset-utils";
import * as Font from "expo-font";
import React from "react";
import { Platform, View } from "react-native";

import Assets from "./Assets";
import AudioManager from "./AudioManager";
import Settings from "./constants/Settings";
import AchievementToastProvider from "./ExpoParty/AchievementToastProvider";
import Fire from "./ExpoParty/Fire";
import Navigation from "./Navigation";
import Gate from "./rematch/Gate";

// import Navigation from "./screens/GameScreen";
console.ignoredYellowBox = Settings.ignoredYellowBox;

const LoadingScreen = Settings.debug ? View : AppLoading;

const assets = AssetUtils.cacheAssetsAsync({
  files: AssetUtils.arrayFromObject(Assets.images),
});

export default function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Fire.shared.init();
    (async () => {
      console.time("Startup");
      try {
        if (Platform.OS !== "web") {
          await Promise.all(assets);
        }
        await Promise.all([
          Font.loadAsync({
            "GothamNarrow-Book": require("./assets/fonts/GothamNarrow-Book.ttf"),
          }),
          AudioManager.shared.setupAsync(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        console.timeEnd("Startup");
        setLoading(false);
      }
    })();
  }, []);

  return loading ? (
    <LoadingScreen />
  ) : (
    <Gate>
      <AchievementToastProvider>
        <Navigation />
      </AchievementToastProvider>
    </Gate>
  );
}
