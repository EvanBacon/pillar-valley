import { router } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChallengesButton from "./Button/Challenges";
import LeaderboardButton from "./Button/Leaderboard";
import PWAButton, { usePWAInstallable } from "./Button/PWAButton";
import PreferencesButton from "./Button/PreferencesButton";
import ShareButton from "./Button/Share";
import SoundButton from "./Button/Sound";
import GameStates from "../Game/GameStates";
import { rewardAdUnitId } from "../constants/Ads";
import Settings from "../constants/Settings";
import { useGameScreenshot, useGameState } from "../zustand/models";

const delay = 100;
const initialDelay = 100;
const duration = 500;
const easing = "ease-out";

function Footer() {
  const { game } = useGameState();
  const { screenshot } = useGameScreenshot();
  const { bottom } = useSafeAreaInsets();
  // Chrome devices can prompt the user to install the website as a PWA
  const canInstallPwa = usePWAInstallable();
  // This state toggles when the user installs so the button isn't rendered anymore
  const [showPWA, setShowPWA] = React.useState(true);
  const animation = game === GameStates.Menu ? "zoomIn" : "zoomOut";

  // const router = useRouter();
  const onChallengesPress = () => {
    router.push("/challenges");
  };
  const onPreferencesPress = () => {
    router.push("/settings");
  };
  const views = [];

  if (Platform.OS !== "web") {
    views.push(<SoundButton />);
  }

  if (canInstallPwa && showPWA) {
    views.push(<PWAButton onInstall={() => setShowPWA(false)} />);
  }

  if (!Settings.isPromo) {
    views.push(<ChallengesButton onPress={onChallengesPress} />);
  }

  const onLeaderboardPress = () => {
    if (Settings.isFirebaseEnabled) {
      router.push("/leaderboard");
    } else {
      alert("Expo Online is disabled");
    }
  };

  if (Settings.isFirebaseEnabled) {
    views.unshift(<LeaderboardButton onPress={onLeaderboardPress} />);
  }
  if (screenshot) {
    views.push(<ShareButton />);
  }

  let adMargin = 0;
  if (!Settings.isPromo && rewardAdUnitId) {
    // views.push(<AdButton />);
    adMargin += 48;
  }
  views.push(<PreferencesButton onPress={onPreferencesPress} />);

  return (
    <View style={[styles.container, { marginBottom: bottom + adMargin }]}>
      {views.map((view, index) => {
        const _delay = index * delay;
        return (
          <Animatable.View
            useNativeDriver={Platform.select({ web: false, default: true })}
            key={index}
            duration={duration + _delay}
            delay={initialDelay + _delay}
            animation={animation}
            easing={easing}
            style={styles.button}
          >
            {view}
          </Animatable.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    height: 64,
    alignItems: "center",
    justifyContent: "space-around",
  },
  button: {
    height: 64,
  },
});

export default Footer;
