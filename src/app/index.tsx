import Head from "expo-router/head";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import GameState from "@/Game/GameState";
import AchievementPopup from "@/components/AchievementPopup";
import Footer from "@/components/Footer";
import GraphicsView from "@/components/GraphicsView";
import Paused from "@/components/Paused";
import ScoreMeta from "@/components/ScoreMeta";
import Song from "@/components/Song";
import TouchableView from "@/components/TouchableView";
import Settings from "@/constants/Settings";
import useAppState from "@/hooks/useAppState";

const InputGameView = Settings.isSimulator ? SkipGameViewInSimulator : GameView;

function GameView({
  onLoad,
  isPaused,
}: {
  onLoad: () => void;
  isPaused: boolean;
}) {
  const machine = new GameState();

  return (
    <TouchableView
      style={{
        flex: 1,
        overflow: "hidden",
      }}
      onTouchesBegan={machine.onTouchesBegan}
    >
      <GraphicsView
        ref={(ref) => (global.gameRef = ref)}
        key="game"
        isPaused={isPaused}
        onContextCreate={async (props) => {
          await machine.onContextCreateAsync(props);
          onLoad();
        }}
        onRender={machine.onRender}
        onResize={machine.onResize}
      />
    </TouchableView>
  );
}

function SkipGameViewInSimulator({ onLoad }: { onLoad: () => void }) {
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
    <>
      <Head>
        <title>Play | Pillar Valley</title>
      </Head>
      <View style={styles.container}>
        <Song />
        <InputGameView onLoad={() => setLoading(false)} isPaused={isPaused} />
        {/* <BottomBannerAd /> */}
        <ScoreMeta />
        <Footer />
        {isPaused && <Paused />}

        {loading && (
          <Image
            style={StyleSheet.absoluteFill}
            source={require("icons/splash.png")}
          />
        )}
        <AchievementPopup />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#F09458",
    pointerEvents: "box-none",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F09458",
  },
});
