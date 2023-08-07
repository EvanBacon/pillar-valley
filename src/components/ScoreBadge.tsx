import * as React from "react";
import { Image, Text, View, ViewStyle } from "react-native";

export default function ScoreBadge({
  style = {},
  children,
  color,
}: {
  color: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          backgroundColor: "#4630eb",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 6,
        },
        style,
      ]}
    >
      <Image
        source={require("../assets/images/expoBadge.png")}
        style={{
          marginRight: 12,
          resizeMode: "contain",
          tintColor: color,
          width: 20,
          height: 20,
        }}
      />
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          marginRight: 6,
          color,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
