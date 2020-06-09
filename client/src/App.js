import { AppLoading } from "expo";
import * as Font from "expo-font";
import React from "react";

import AudioManager from "./AudioManager";
import Fire from "./ExpoParty/Fire";
import Navigation from "./Navigation";
import Gate from "./rematch/Gate";

export default function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Fire.shared.init();
    (async () => {
      console.time("Setup");
      try {
        await Promise.all([
          Font.loadAsync({
            "GothamNarrow-Book": require("./assets/fonts/GothamNarrow-Book.ttf"),
          }),
          AudioManager.shared.setupAsync(),
        ]);
      } catch (error) {
        console.log("Error loading fonts and audio!");
        console.error(error);
      } finally {
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
