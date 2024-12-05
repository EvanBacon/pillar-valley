import { StyleSheet, Text, TouchableHighlight } from "react-native";

export default function Footer({ style, ...props }) {
  return (
    <TouchableHighlight
      underlayColor="#eeeeee"
      {...props}
      style={[styles.touchable, style]}
    >
      <Text style={styles.text}>Load More...</Text>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  touchable: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.3)",
  },
  text: { fontWeight: "bold", fontSize: 16 },
});
