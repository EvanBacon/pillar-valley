import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export default function useAppState(): AppStateStatus {
  const currentState = AppState.currentState;
  const [appState, setAppState] = useState<AppStateStatus>(currentState);

  function onChange(newState: AppStateStatus) {
    setAppState(newState);
  }

  useEffect(() => {
    const sub = AppState.addEventListener("change", onChange);

    return () => {
      sub.remove();
    };
  });

  return appState;
}
