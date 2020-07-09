import { AdMobBanner as NAdMobBanner } from "expo-ads-admob";
import React from "react";
import { Platform, StyleSheet } from "react-native";

// todo: maybe just hardcode the adUnitID

export const AdMobBanner = React.forwardRef(
  (
    { adUnitID, ...props }: React.ComponentProps<typeof NAdMobBanner>,
    ref: any
  ) => (
    <NAdMobBanner
      {...props}
      adUnitID={
        __DEV__
          ? // Test IDs
            Platform.select({
              ios: "ca-app-pub-3940256099942544/2934735716",
              android: "ca-app-pub-3940256099942544/6300978111",
            })
          : // Overridden ID
            adUnitID
      }
      ref={ref}
    />
  )
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC266",
  },
});
