import * as StoreReview from "expo-store-review";
import React from "react";

export default function useStoreReview(): boolean {
  const [supportsStoreReview, setStoreReview] = React.useState(false);
  React.useEffect(() => {
    if (process.env.EXPO_OS !== "ios") return;
    StoreReview.isAvailableAsync().then((isAvailable) => {
      setStoreReview(isAvailable);
    });
  }, []);
  return supportsStoreReview;
}
