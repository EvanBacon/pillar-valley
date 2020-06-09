import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { Component } from "react";
import { Platform, StyleSheet } from "react-native";

import AudioManager from "../../AudioManager";
import TouchableBounce from "../TouchableBounce"; // eslint-disable-line

export default class Icon extends Component {
  static defaultProps = {
    soundIn: "button_in",
    soundOut: "button_out",
    size: 24,
    color: "#ffffff",
    onPress: () => {},
  };

  render() {
    const {
      onPress,
      size,
      color,
      name,
      soundOut,
      soundIn,
      source,
      style,
      iconStyle,
    } = this.props;
    return (
      <TouchableBounce
        onPress={onPress}
        onPressIn={() => AudioManager.shared.playAsync(soundIn)}
        onPressOut={() => AudioManager.shared.playAsync(soundOut)}
        style={[styles.container, style]}
      >
        <FontAwesome
          size={size}
          color={color}
          name={name}
          style={[styles.icon, iconStyle]}
        />
      </TouchableBounce>
    );
  }
}

const size = 56;

const styles = StyleSheet.create({
  container: {
    width: size,
    minWidth: size,
    height: size,
    minHeight: size,
    maxHeight: size,
    backgroundColor: "transparent",
    borderBottomWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  icon: {
    backgroundColor: "transparent",
    marginBottom: Platform.select({ web: "1rem", default: 0 }),
  },
});
