import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import AchievementPopup from "@/src/components/AchievementPopup";
import Footer from "@/src/components/Footer";
import GraphicsView from "@/src/components/GraphicsView";
import Paused from "@/src/components/Paused";
import ScoreMeta from "@/src/components/ScoreMeta";
import Song from "@/src/components/Song";
import TouchableView from "@/src/components/TouchableView";
import Settings from "@/src/constants/Settings";
import GameState from "@/src/Game/GameState";
import useAppState from "@/src/hooks/useAppState";

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
          global.gameRef = ref;
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

export default function GameScreen() {
  const [loading, setLoading] = React.useState(true);
  const appState = useAppState();
  const isPaused = appState !== "active";

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Song />
      <InputGameView onLoad={() => setLoading(false)} isPaused={isPaused} />
      {/* <BottomBannerAd /> */}
      <ScoreMeta />
      <Footer />
      {isPaused && <Paused />}

      {loading && (
        <Image
          style={StyleSheet.absoluteFill}
          source={require("../icons/splash.png")}
        />
      )}
      <AchievementPopup />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#FFC266",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC266",
  },
});
