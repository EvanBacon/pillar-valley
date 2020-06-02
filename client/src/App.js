import { AppLoading } from "expo";
import AssetUtils from "expo-asset-utils";
import React from "react";
import { View } from "react-native";

import Assets from "./Assets";
import AudioManager from "./AudioManager";
import Settings from "./constants/Settings";
import AchievementToastProvider from "./ExpoParty/AchievementToastProvider";
import Fire from "./ExpoParty/Fire";
// import Navigation from "./screens/GameScreen";
import Navigation from "./Navigation";
import Gate from "./rematch/Gate";

console.ignoredYellowBox = Settings.ignoredYellowBox;

const LoadingScreen = Settings.debug ? View : AppLoading;

const getFonts = () => {
  const items = {};
  const keys = Object.keys(Assets.fonts || {});
  for (const key of keys) {
    const item = Assets.fonts[key];
    const name = key.substr(0, key.lastIndexOf("."));
    items[name] = item;
  }
  return [items];
};

const getFiles = () => {
  return AssetUtils.arrayFromObject(Assets.images);
};

const assets = AssetUtils.cacheAssetsAsync({
  fonts: getFonts(),
  files: getFiles(),
});

export default function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Fire.shared.init();
    (async () => {
      console.time("Startup");
      try {
        await Promise.all(assets);
        await AudioManager.shared.setupAsync();
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
