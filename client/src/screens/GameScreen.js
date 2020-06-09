import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import Song from "../components/Song";

import Settings from "../constants/Settings";
import GraphicsView from "../components/GraphicsView";
import Footer from "../components/Footer";
import ScoreMeta from "../components/ScoreMeta";
import TouchableView from "../components/TouchableView";

import Game from "../Game/Game";
import { Renderer } from "expo-three";
class GameState {
  onContextCreateAsync = async ({ gl, width, height, pixelRatio }) => {
    this.renderer = new Renderer({
      gl,
      width,
      height,
      pixelRatio,
    });

    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();
  };

  onTouchesBegan = (state) => this.game.onTouchesBegan(state);

  onResize = (layout) => {
    const { scale } = layout;
    const width = layout.width;
    const height = layout.height;

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    if (this.game) {
      this.game.onResize({ width, height });
    }
  };

  onRender = (delta, time) => {
    this.game.update(delta, time);
    this.renderer.render(this.game.scene, this.game.camera);
  };
}

const InputGameView = Settings.isSimulator ? SkipGameViewInSimulator : GameView;

function GameView({ onLoad }) {
  const machine = React.useMemo(() => {
    if (Settings.isSimulator) return null;
    return new GameState();
  }, []);

  const onContextCreate = React.useMemo(
    () => async (props) => {
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
      onTouchesBegan={machine.onTouchesBegan}
    >
      <GraphicsView
        ref={(ref) => (global.gameRef = ref)}
        key="game"
        onContextCreate={onContextCreate}
        onRender={machine.onRender}
        onResize={machine.onResize}
      />
    </TouchableView>
  );
}

export default function GameScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Song />

      <InputGameView onLoad={() => setLoading(false)} />
      <ScoreMeta />
      <Footer navigation={navigation} />

      {loading && (
        <Image
          style={StyleSheet.absoluteFill}
          source={require("../assets/icons/splash.png")}
        />
      )}
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
