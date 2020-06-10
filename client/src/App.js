import { AppLoading } from "expo";
import * as Font from "expo-font";
import React from "react";

import AudioManager from "./AudioManager";
import Fire from "./ExpoParty/Fire";
import Navigation from "./Navigation";
import Gate from "./rematch/Gate";
import * as Analytics from "expo-firebase-analytics";

const getNow = global.nativePerformanceNow || Date.now;

export default function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Fire.shared.init();
    (async () => {
      console.time("Setup");
      let time = getNow();
      try {
        await Promise.all([
          Font.loadAsync({
            "GothamNarrow-Book": require("./assets/fonts/GothamNarrow-Book.ttf"),
          }),
          AudioManager.shared.setupAsync(),
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
      <Navigation />
    </Gate>
  );
}

// <AchievementToastProvider>
//   <Navigation />
// </AchievementToastProvider>
