import { Platform } from "react-native";

// Test IDs iOS: https://developers.google.com/admob/ios/test-ads
// Android: https://developers.google.com/admob/android/test-ads
export const rewardAdUnitId = Platform.select<string | null>({
  ios: process.env.EXPO_PUBLIC_AD_MOB_UNIT_ID_IOS,
  android: process.env.EXPO_PUBLIC_AD_MOB_UNIT_ID_ANDROID,
  default: null,
});
