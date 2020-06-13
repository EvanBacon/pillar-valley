import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleSheet, Platform, Text, View } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";
import * as Animatable from "react-native-animatable";
import Settings from "../constants/Settings";
function ScoreMeta({ current, best, currency }) {
  const { top } = useSafeArea();
  return (
    <View style={[styles.container, { top }]}>
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.text, styles.highScore]}>{best}</Text>
        <Animatable.Text
          animation="rubberBand"
          key={current}
          style={[styles.text, styles.score]}
        >
          {current}
        </Animatable.Text>
      </View>
      {Settings.gemsEnabled && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.text, styles.currency]}>{currency}</Text>
          <FontAwesome
            name="diamond"
            size={20}
            color="lime"
            style={{
              marginHorizontal: 6,
              ...Platform.select({ web: { userSelect: "none" }, default: {} }),
            }}
          />
        </View>
      )}
    </View>
  );
}

export default connect(
  ({ score: { current, best }, currency: { current: currency } }) => ({
    current,
    best,
    currency,
  })
)(ScoreMeta);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontFamily: "GothamNarrow-Book",
    opacity: 0.8,
    fontSize: 48,
    backgroundColor: "transparent",
    ...Platform.select({ web: { userSelect: "none" }, default: {} }),
  },
  score: {
    color: "white",
  },
  highScore: {
    color: "yellow",
    textAlign: "right",
    fontSize: 24,
    marginRight: 6,
  },
  currency: {
    fontSize: 24,
    color: "white",
  },
});
