import * as StoreReview from "expo-store-review";
import React from "react";

export default function useStoreReview() {
  const [supportsStoreReview, setStoreReview] = React.useState(false);
  React.useEffect(() => {
    StoreReview.isAvailableAsync().then((isAvailable) => {
      setStoreReview(isAvailable);
    });
  }, []);
  return supportsStoreReview;
}
