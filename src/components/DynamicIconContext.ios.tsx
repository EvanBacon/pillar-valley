import Constants, { ExecutionEnvironment } from "expo-constants";
import React from "react";
import AppIcon from "react-native-dynamic-app-icon";
export const icons = [
  {
    name: "Auto",
    source: require("@/icons/pillars/default.png"),
    iconId: null,
  },
  {
    name: "Spring",
    source: require("@/icons/pillars/spring.png"),
    iconId: "spring",
  },
  {
    name: "Autumn",
    source: require("@/icons/pillars/autumn.png"),
    iconId: "autumn",
  },
  {
    name: "Solstice",
    source: require("@/icons/pillars/solstice.png"),
    iconId: "solstice",
  },
  {
    name: "Winter",
    source: require("@/icons/pillars/winter.png"),
    iconId: "winter",
  },
  {
    name: "Bacon",
    source: require("@/icons/pillars/special.png"),
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

function useIconNameExpoGo() {
  return React.useState<string | null>(null);
}

function useIconNameCustom() {
  const [icon, _setIcon] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    AppIcon.getIconName((result) => {
      if (isMounted) _setIcon(result.iconName);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setIcon = React.useCallback(
    (icon: string | null) => {
      AppIcon.setAppIcon(icon);
      _setIcon(icon || null);
    },
    [_setIcon]
  );
  return [icon === "default" ? null : icon, setIcon];
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
