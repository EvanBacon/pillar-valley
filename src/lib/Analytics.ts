import Constants, { ExecutionEnvironment } from "expo-constants";

export function logEvent(name: string, params?: Record<string, any>) {
  if (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    __DEV__
  ) {
    return;
  }
  // const { logEvent } = require("expo-firebase-analytics");
  // logEvent(name, params);
}
