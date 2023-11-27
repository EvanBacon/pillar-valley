import React from "react";

export const icons = [
  {
    name: "Auto",
    source: require("icons/pillars/default.png"),
    iconId: null,
  },
];

export default function DynamicIconProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function useSelectedIconSource(): any | null {
  return require("icons/pillars/default.png");
}

export function useDynamicAppIcon(): [
  string | null,
  (iconName: string | null) => void
] {
  return [null, () => {}];
}
