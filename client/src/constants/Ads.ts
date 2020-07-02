import { Platform } from "react-native";

export const adUnitId = Platform.select<string | null>({
  ios: "ca-app-pub-2312569320461549/2517428180",
  android: null, // todo: android
  default: null,
});
