import React from "react";
import { StyleSheet, View } from "react-native";

export default function Separator(props) {
  return <View {...props} style={[styles.container, props.style]} />;
}

const styles = StyleSheet.create({
  container: {
    height: StyleSheet.hairlineWidth,
    width: "auto",
    marginLeft: 16,
    backgroundColor: "#21222D",
  },
});
