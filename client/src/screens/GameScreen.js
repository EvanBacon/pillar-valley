import React from "react";
import { Image, StyleSheet, View } from "react-native";

import Game from "../components/Game";
import Song from "../components/Song";

function GameScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);

  return (
    <View style={styles.container}>
      <Song />

      <Game navigation={navigation} onLoad={() => setLoading(false)} />
      {loading && (
        <Image
          style={StyleSheet.absoluteFill}
          source={require("../assets/icons/splash.png")}
        />
      )}
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

export default GameScreen;
