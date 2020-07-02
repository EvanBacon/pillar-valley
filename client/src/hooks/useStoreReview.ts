import * as StoreReview from "expo-store-review";
import React from "react";
import { Platform } from "@unimodules/core";

export default function useStoreReview(): boolean {
  const [supportsStoreReview, setStoreReview] = React.useState(false);
  React.useEffect(() => {
    if (Platform.OS !== "ios") return;
    StoreReview.isAvailableAsync().then((isAvailable) => {
      setStoreReview(isAvailable);
    });
  }, []);
  return supportsStoreReview;
}
