import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import Constants from "expo-constants";
export default class Header extends React.Component {
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };
  render() {
    const { title, buttonTitle, index, onPress, style, ...props } = this.props;
    return (
      <TouchableHighlight
        underlayColor="#eeeeee"
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}
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
}

const styles = StyleSheet.create({
  touchable: {},
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
  text: { fontSize: 16, fontWeight: "bold", opacity: 0.7 },
  link: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
});
