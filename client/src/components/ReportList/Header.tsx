import Constants from "expo-constants";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

export default function Header({
  title,
  buttonTitle,
  index,
  onPress,
  ...props
}) {
  return (
    <TouchableHighlight
      underlayColor="#eeeeee"
      {...props}
      onPress={() => onPress(item, index)}
    >
      <View style={styles.container}>
        <View>
          <Text style={styles.text}>{title}</Text>
        </View>
        <Text style={styles.link}>{buttonTitle}</Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "rgba(0,0,0,0.3)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { fontWeight: "bold", opacity: 0.7 },
  link: {
    color: Constants.manifest.primaryColor,
  },
});
