import React from "react";
import { StyleSheet, Platform, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";

import Settings from "../constants/Settings";
import GameStates from "../Game/GameStates";
import useStoreReview from "../hooks/useStoreReview";
import LeaderboardButton from "./Button/Leaderboard";
import LicensesButton from "./Button/LicensesButton";
import RateButton from "./Button/Rate";
import ShareButton from "./Button/Share";
import SoundButton from "./Button/Sound";
import PWAButton, { canInstallPWA } from "./Button/PWAButton";
import SwapPlatformButton, {
  getOtherPlatform,
} from "./Button/SwapPlatformButton";

const delay = 100;
const initialDelay = 100;
const duration = 500;
const easing = "ease-out";

function Footer({ game, screenshot, navigation }) {
  const { bottom } = useSafeArea();
  const supportsStoreReview = useStoreReview();
  const animation = game === GameStates.Menu ? "zoomIn" : "zoomOut";
  const onLicensesPress = () => {
    navigation.navigate("Licenses");
  };
  const views = [];

  if (Platform.OS !== "web") {
    views.push(<SoundButton />);
  }

  if (getOtherPlatform()) {
    views.push(<SwapPlatformButton />);
  }

  if (canInstallPWA()) {
    views.push(<PWAButton />);
  }

  views.push(<LicensesButton onPress={onLicensesPress} />);

  const onLeaderboardPress = () => {
    if (Settings.isFirebaseEnabled) {
      navigation.navigate("Social");
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

  if (supportsStoreReview) {
    views.push(<RateButton />);
  }
  return (
    <View style={[styles.container, { marginBottom: bottom }]}>
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

export default connect(({ game, screenshot }) => ({ game, screenshot }))(
  Footer
);
