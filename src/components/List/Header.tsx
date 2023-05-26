import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

export default function Header({
  title,
  buttonTitle,
  item,
  index,
  onPress,
  style,
  ...props
}: any) {
  return (
    <TouchableHighlight
      underlayColor="#191A23"
      {...props}
      onPress={() => onPress(item, index)}
      style={[styles.touchable, style]}
    >
      <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.link}>{buttonTitle}</Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  touchable: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "rgba(0,0,0,0.3)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { fontSize: 16, fontWeight: "bold", color: "#fff", opacity: 0.7 },
  link: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
