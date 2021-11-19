import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Paused() {
  const color = "white";
  const { left } = useSafeAreaInsets();
  return (
    <BlurView
      intensity={95}
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: "GothamNarrow-Book",
            textAlign: "center",
            color: color,
            fontSize: 48,
          }}
        >
          <FontAwesome color={color} size={48} name="pause" /> Paused
        </Text>
        <Animatable.Text
          animation="fadeIn"
          delay={1000}
          style={{
            fontFamily: "GothamNarrow-Book",
            textAlign: "center",
            color: color,
            fontSize: 18,
          }}
        >
          Valleys cannot be traversed in the background
        </Animatable.Text>
      </View>
      <Animatable.Text
        animation="fadeIn"
        delay={1500}
        style={{
          fontFamily: "GothamNarrow-Book",
          color: color,
          fontSize: 18,
          textAlign: "center",
          paddingHorizontal: left,
          width: "75%",
          marginBottom: 24,
        }}
      >
        Also you can follow me on Twitter and Instagram @baconbrix
      </Animatable.Text>
    </BlurView>
  );
}
