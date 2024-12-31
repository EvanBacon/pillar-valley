import Constants, { ExecutionEnvironment } from "expo-constants";
import * as AppIcon from "expo-quick-actions/icon";
import React from "react";

import { logEvent } from "@/lib/Analytics";

export const icons = [
  {
    name: "Auto",
    source: require("icons/pillars/default.png"),
    sourceDark: require("icons/pillars/default-dark.png"),
    iconId: null,
  },
  {
    name: "Spring",
    source: require("icons/pillars/spring.png"),
    iconId: "spring",
  },
  {
    name: "Autumn",
    source: require("icons/pillars/autumn.png"),
    iconId: "autumn",
  },
  {
    name: "Solstice",
    source: require("icons/pillars/solstice.png"),
    iconId: "solstice",
  },
  {
    name: "Winter",
    source: require("icons/pillars/winter.png"),
    iconId: "winter",
  },
  {
    name: "Bacon",
    source: require("icons/pillars/special.png"),
    iconId: "special",
  },
];

const DynamicIconContext = React.createContext<{
  iconName: string | null;
  setIconName: (iconName: string | null) => void;
}>({
  iconName: null,
  setIconName: () => {},
});

export default function DynamicIconProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [iconName, setIconName] = useIconName();

  return (
    <DynamicIconContext.Provider value={{ iconName, setIconName }}>
      {children}
    </DynamicIconContext.Provider>
  );
}

const useIconName =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? useIconNameExpoGo
    : useIconNameCustom;

function useIconNameExpoGo(): [string | null, (name: string | null) => void] {
  return React.useState<string | null>(null);
}

function useIconNameCustom(): [string | null, (name: string | null) => void] {
  const [icon, _setIcon] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!AppIcon.isSupported) {
      return;
    }
    let isMounted = true;
    AppIcon.getIcon?.().then((icon) => {
      if (isMounted) _setIcon(icon || null);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setIcon = React.useCallback(
    (icon: string | null) => {
      if (!AppIcon.isSupported) {
        return;
      }

      logEvent("set_icon", { icon: icon || "default" });
      AppIcon.setIcon?.(icon);
      _setIcon(icon || null);
    },
    [_setIcon]
  );
  return [icon, setIcon];
}

export function useSelectedIconSource(): any | null {
  const [_icon] = useDynamicAppIcon();

  return React.useMemo(() => {
    const icon = icons.find((icon) => icon.iconId === _icon);
    return icon ? icon.source : null;
  }, [_icon]);
}

export function useDynamicAppIcon() {
  const ctx = React.useContext(DynamicIconContext);
  if (!ctx) throw new Error("Missing DynamicIconProvider");
  return [ctx.iconName, ctx.setIconName];
}
