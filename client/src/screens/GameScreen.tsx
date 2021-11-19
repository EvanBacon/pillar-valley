import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Clipboard from 'expo-clipboard';
import AchievementPopup from "../components/AchievementPopup";
import { AdMobBanner } from "../components/AdMob";
import Footer from "../components/Footer";
import GraphicsView from "../components/GraphicsView";
import Paused from "../components/Paused";
import ScoreMeta from "../components/ScoreMeta";
import Song from "../components/Song";
import TouchableView from "../components/TouchableView";
import Settings from "../constants/Settings";
import GameState from "../Game/GameState";
import useAppState from "../hooks/useAppState";

// import GameState from "../NitroRoll/GameState";
const InputGameView = Settings.isSimulator ? SkipGameViewInSimulator : GameView;

function GameView({ onLoad, isPaused }) {
  const machine = React.useMemo(() => {
    if (Settings.isSimulator) return null;
    return new GameState();
  }, []);

  const onContextCreate = React.useCallback(
    async (props) => {
      if (machine) {
        await machine.onContextCreateAsync(props);
      }
      onLoad();
    },
    [onLoad, machine]
  );

  return (
    <TouchableView
      style={{
        flex: 1,
        overflow: "hidden",
      }}
      onTouchesBegan={machine?.onTouchesBegan}
    >
      <GraphicsView
        ref={(ref) => (global.gameRef = ref)}
        key="game"
        isPaused={isPaused}
        onContextCreate={onContextCreate}
        onRender={machine?.onRender}
        onResize={machine?.onResize}
      />
    </TouchableView>
  );
}

export default function GameScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const appState = useAppState();
  const isPaused = appState !== "active";

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Song />
      <InputGameView onLoad={() => setLoading(false)} isPaused={isPaused} />
      <BottomBannerAd />
      <ScoreMeta />
      <Footer navigation={navigation} />
      {isPaused && <Paused />}

      {loading && (
        <Image
          style={StyleSheet.absoluteFill}
          source={require("../../icons/splash.png")}
        />
      )}
      <AchievementPopup navigation={navigation} />
    </View>
  );
}

function BottomBannerAd() {
  const [showAd, setShowAd] = React.useState<boolean>(false);
  const { bottom } = useSafeAreaInsets();

  const onBannerError = React.useCallback((errorDescription: string) => {
    console.log("Banner error: ", errorDescription);
    setShowAd(false);
  }, []);

  Clipboard.setString("");

  // Test ID, Replace with your-admob-unit-id
  const adUnitID = Platform.select({
    ios: "ca-app-pub-2312569320461549/6612342018",
    android: "ca-app-pub-2312569320461549/6685058859",
  });

  const display = showAd ? "flex" : "none";
  return (
    <View style={{ display, position: "absolute", bottom, left: 0, right: 0 }}>
      <AdMobBanner
        onAdViewDidReceiveAd={() => setShowAd(true)}
        bannerSize="smartBannerPortrait"
        adUnitID={adUnitID}
        servePersonalizedAds
        onDidFailToReceiveAdWithError={onBannerError}
      />
    </View>
  );
}
function SkipGameViewInSimulator({ onLoad }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
      }}
      ref={() => onLoad()}
    >
      <Text style={{ color: "white", fontSize: 36, textAlign: "center" }}>
        Graphics are disabled in the simulator
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC266",
  },
});
