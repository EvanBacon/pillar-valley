import Constants from "expo-constants";
import { Platform } from "react-native";

function storeUrl() {
  const { OS } = Platform;
  const manifest = Constants.manifest[OS];

  if (OS === "ios") {
    return manifest.appStoreUrl;
  }
  return manifest.playStoreUrl;
}

export default storeUrl;
