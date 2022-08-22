import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export default function useAppState(): AppStateStatus {
  const currentState = AppState.currentState;
  const [appState, setAppState] = useState<AppStateStatus>(currentState);

  function onBlur() {
    setAppState("background");
  }
  function onFocus() {
    setAppState("active");
  }

  useEffect(() => {
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  });

  return appState;
}
