import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFont } from "../hooks/useFont";

export default function Paused() {
  const color = "white";
  const { left } = useSafeAreaInsets();

  // TODO: Remove with RN 72
  const gothamNarrowBook = useFont("GothamNarrow-Book");
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
            fontFamily: gothamNarrowBook,
            textAlign: "center",
            color,
            fontSize: 48,
          }}
        >
          <FontAwesome color={color} size={48} name="pause" /> Paused
        </Text>
        <Animatable.Text
          animation="fadeIn"
          delay={1000}
          style={{
            fontFamily: gothamNarrowBook,
            textAlign: "center",
            color,
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
          fontFamily: gothamNarrowBook,
          color,
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
