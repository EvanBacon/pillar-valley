import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "@/lib/expo-haptics";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import AudioManager from "../../AudioManager";
import TouchableBounce from "../TouchableBounce";
import { SF } from "../sf-symbol";

export default function Icon({
  onPressIn,
  onPress = () => {},
  size = 24,
  color = "#fff",
  name,
  soundOut = "button_out",
  soundIn = "button_in",
  style,
  iconStyle,
  fallback,
}: any) {
  return (
    <TouchableBounce
      onPress={onPress}
      onPressIn={() => {
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium);
        onPressIn?.();
        AudioManager.playAsync(soundIn);
      }}
      onPressOut={() => AudioManager.playAsync(soundOut)}
      style={[styles.container, style]}
    >
      <SF
        size={size}
        color={color}
        name={name}
        fallback={
          <FontAwesome
            size={size}
            color={color}
            name={fallback ?? name}
            style={[styles.icon, iconStyle]}
          />
        }
      />
    </TouchableBounce>
  );
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
    // @ts-ignore
    marginBottom: Platform.select({ web: "1rem", default: 0 }),
  },
});
