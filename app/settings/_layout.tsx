import { router, Stack } from "expo-router";
import TouchableBounce from "@/src/components/TouchableBounce";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Platform } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

function BackButton() {
  if (Platform.OS === "web") {
    return null;
  }
  return (
    <TouchableBounce onPress={() => router.back()}>
      <FontAwesome size={24} color="white" name="angle-down" />
    </TouchableBounce>
  );
}

export default function Settings() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "#F09458",
          borderBottomWidth: 0,
        },
        headerTitleStyle: { color: "white" },
        headerRight: BackButton,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="icon" options={{ title: "App Icon" }} />
    </Stack>
  );
}
