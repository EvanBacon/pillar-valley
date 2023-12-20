import Constants, { ExecutionEnvironment } from "expo-constants";
import { customEvent } from "vexo-analytics";

export function logEvent(
  name: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    __DEV__
  ) {
    return;
  }

  // customEvent(name, params);
}
