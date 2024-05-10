import { SymbolView, SymbolViewProps } from "expo-symbols";

import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

export function SF({
  size,
  color,
  fallback,
  name,
}: {
  size: number;
  color: string;
  name: SymbolViewProps["name"];
  fallback: React.ComponentProps<typeof Ionicons>["name"] | React.ReactNode;
}) {
  return (
    <SymbolView
      weight="semibold"
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={{
        width: size,
        height: size,
      }}
      //   animationSpec={
      //     {
      //       // variableAnimationSpec: {
      //       //   cumulative: true,
      //       //   dimInactiveLayers: false,
      //       // },
      //       // repeatCount: 0,
      //       // repeating: false,
      //     }
      //   }
      fallback={
        typeof fallback === "string" ? (
          <Ionicons color={color} size={size} name={fallback} />
        ) : (
          fallback
        )
      }
    />
  );
}
