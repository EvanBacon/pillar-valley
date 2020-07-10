import { Platform } from "react-native";

// Test IDs iOS: https://developers.google.com/admob/ios/test-ads
// Android: https://developers.google.com/admob/android/test-ads
export const rewardAdUnitId = __DEV__
  ? Platform.select<string | null>({
      ios: "ca-app-pub-3940256099942544/1712485313",
      android: "ca-app-pub-3940256099942544/5224354917",
      default: null,
    })
  : Platform.select<string | null>({
      ios: "ca-app-pub-2312569320461549/2517428180",
      android: "ca-app-pub-2312569320461549/9830096940", // todo: android
      default: null,
    });
