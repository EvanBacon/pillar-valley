import { Text } from "react-native";
export default function IconPickerDefault() {
  return <Text>Icon picking is not supported on this platform</Text>;
}

export function useSelectedIconSource() {
  return require("icons/pillars/default.png");
}
