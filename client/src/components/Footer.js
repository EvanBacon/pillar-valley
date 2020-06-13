import { AdMobRewarded } from "expo-ads-admob";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";

import Settings from "../constants/Settings";
import GameStates from "../Game/GameStates";
import useStoreReview from "../hooks/useStoreReview";
import ChallengesButton from "./Button/Challenges";
import Icon from "./Button/Icon";
import LeaderboardButton from "./Button/Leaderboard";
import LicensesButton from "./Button/LicensesButton";
import PWAButton, { usePWAInstallable } from "./Button/PWAButton";
import RateButton from "./Button/Rate";
import ShareButton from "./Button/Share";
import SoundButton from "./Button/Sound";
import SwapPlatformButton, {
  getOtherPlatform,
} from "./Button/SwapPlatformButton";

const delay = 100;
const initialDelay = 100;
const duration = 500;
const easing = "ease-out";

function AdButton() {
  return (
    <Icon
      name="money"
      onPress={async () => {
        // Display a rewarded ad
        await AdMobRewarded.setAdUnitID(
          Platform.select({
            ios: "ca-app-pub-2312569320461549/2517428180",
          })
        ); // Test ID, Replace with your-admob-unit-id
        await AdMobRewarded.requestAdAsync();
        await AdMobRewarded.showAdAsync();
      }}
    />
  );
}

function Footer({ game, screenshot, navigation }) {
  const { bottom } = useSafeArea();
  const supportsStoreReview = useStoreReview();
  // Chrome devices can prompt the user to install the website as a PWA
  const canInstallPwa = usePWAInstallable();
  // This state toggles when the user installs so the button isn't rendered anymore
  const [showPWA, setShowPWA] = React.useState(true);
  const animation = game === GameStates.Menu ? "zoomIn" : "zoomOut";
  const onLicensesPress = () => {
    // dispatch.presentAchievement.set({ name: "Nerdy boi", score: null });
    navigation.navigate("Licenses");
  };
  const onChallengesPress = () => {
    navigation.navigate("Challenges");
  };
  const views = [];

  if (Platform.OS !== "web") {
    views.push(<SoundButton />);
  }

  if (!Settings.isPromo && getOtherPlatform()) {
    views.push(<SwapPlatformButton />);
  }

  if (canInstallPwa && showPWA) {
    views.push(<PWAButton onInstall={() => setShowPWA(false)} />);
  }

  if (!Settings.isPromo) {
    views.push(<ChallengesButton onPress={onChallengesPress} />);
    views.push(<LicensesButton onPress={onLicensesPress} />);
  }

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

  if (!Settings.isPromo && supportsStoreReview) {
    views.push(<RateButton />);
  }
  if (!Settings.isPromo && Platform.OS !== "web") {
    views.push(<AdButton />);
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
