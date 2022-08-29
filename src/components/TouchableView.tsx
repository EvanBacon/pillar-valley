import { ViewProps } from "@expo/html-elements/build/primitives/View";
import React from "react";
import { View } from "react-native";

export default function TouchableView({
  onTouchesBegan,
  style = {},
  ...props
}: ViewProps & { onTouchesBegan: (event: any) => void }) {
  return (
    <View
      style={[{ flex: 1, cursor: "pointer" }, style]}
      // @ts-ignore
      tabIndex="0"
      onKeyDown={(e: any) => {
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
