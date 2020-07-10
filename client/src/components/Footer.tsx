import { AdMobRewarded } from "expo-ads-admob";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";

import { rewardAdUnitId } from "../constants/Ads";
import Settings from "../constants/Settings";
import GameStates from "../Game/GameStates";
import ChallengesButton from "./Button/Challenges";
import Icon from "./Button/Icon";
import LeaderboardButton from "./Button/Leaderboard";
import LicensesButton from "./Button/LicensesButton";
import PWAButton, { usePWAInstallable } from "./Button/PWAButton";
import ShareButton from "./Button/Share";
import SoundButton from "./Button/Sound";
import PreferencesButton from "./Button/PreferencesButton";
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
        await AdMobRewarded.setAdUnitID(rewardAdUnitId!);
        await AdMobRewarded.requestAdAsync();
        await AdMobRewarded.showAdAsync();
      }}
    />
  );
}

function Footer({ game, screenshot, navigation }) {
  const { bottom } = useSafeArea();
  // Chrome devices can prompt the user to install the website as a PWA
  const canInstallPwa = usePWAInstallable();
  // This state toggles when the user installs so the button isn't rendered anymore
  const [showPWA, setShowPWA] = React.useState(true);
  const animation = game === GameStates.Menu ? "zoomIn" : "zoomOut";

  const onChallengesPress = () => {
    navigation.navigate("Challenges");
  };
  const onPreferencesPress = () => {
    navigation.navigate("Preferences");
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

  let adMargin = 0;
  if (!Settings.isPromo && rewardAdUnitId) {
    views.push(<AdButton />);
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

export default connect(({ game, screenshot }) => ({ game, screenshot }))(
  Footer
);
