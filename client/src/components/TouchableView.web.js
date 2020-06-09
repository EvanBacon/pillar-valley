import React from "react";
import { View, StyleSheet } from "react-native";

export default function TouchableView({
  onTouchesBegan,
  style = {},
  ...props
}) {
  return (
    <View
      style={StyleSheet.flatten([{ flex: 1, cursor: "pointer" }, style])}
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.keyCode === 13 || e.keyCode === 32) {
          onTouchesBegan(e);
        }
      }}
      onMouseDown={onTouchesBegan}
      onTouchStart={onTouchesBegan}
      onTouchEnd={(e) => e.preventDefault()}
      {...props}
    />
  );
}
