import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AchievementPopup from "../components/AchievementPopup";
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
  // return null;

  return (
    <TouchableView
      style={{
        flex: 1,
        overflow: "hidden",
      }}
      onTouchesBegan={machine?.onTouchesBegan}
    >
      <GraphicsView
        ref={(ref) => {
          global.gameRef = ref
        }}
        key="game"
        isPaused={isPaused}
        onContextCreate={onContextCreate}
        onRender={machine.onRender}
        onResize={machine.onResize}
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
      {/* <BottomBannerAd /> */}
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
