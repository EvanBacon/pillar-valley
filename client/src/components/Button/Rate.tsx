import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import React from "react";
import { Alert, Linking } from "react-native";

import useStoreReview from "../../hooks/useStoreReview";
import Icon from "./Icon";
import * as Analytics from "expo-firebase-analytics";

const { name } = Constants.manifest;

function alertToReview() {
  Alert.alert(
    `Do you like ${name}?`,
    `Would you like to rate this app in the app store? It help's others discover ${name} too!`,
    [
      {
        text: "OK",
        onPress: () => Linking.openURL(StoreReview.storeUrl()),
      },
      { text: "Cancel", onPress: () => {}, style: "cancel" },
    ],
    { cancelable: true }
  );
}

function Rate() {
  const canReview = useStoreReview();

  const onPress = React.useMemo(
    () => () => {
      Analytics.logEvent("store_review", { can_review: canReview });
      if (canReview) {
        StoreReview.requestReview();
      } else {
        alertToReview();
      }
    },
    [canReview]
  );

  return <Icon onPress={onPress} name="star" />;
}

export default Rate;
