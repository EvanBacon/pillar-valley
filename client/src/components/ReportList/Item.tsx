import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

export default function Item({ item, index, onPress, ...props }) {
  return (
    <TouchableHighlight
      {...props}
      underlayColor="#eeeeee"
      onPress={() => {
        onPress(item, index);
      }}
    >
      <View style={styles.container}>
        <Text style={styles.text}>{item.name}</Text>
        <Ionicons size={24} color="#CCCCCC" name="ios-arrow-forward" />
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: { fontWeight: "bold" },
});
