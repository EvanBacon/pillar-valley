import TouchableBounce from "@/src/components/TouchableBounce";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Stack } from "expo-router";
import { Platform } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

function BackButton() {
  if (Platform.OS === "web") {
    return null;
  }
  return (
    <TouchableBounce
      onPress={() => {
        // TODO: Fix going back multiple times when nested.
        router.back();
      }}
    >
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
          backgroundColor: "#21222B",
          borderBottomWidth: 0,
        },
        headerBackTitleStyle: {
          fontFamily: "Inter_500Medium",
        },

        headerTitleStyle: { color: "white", fontFamily: "Inter_500Medium" },
        headerRight: BackButton,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="icon" options={{ title: "App Icon" }} />
      <Stack.Screen name="licenses" options={{ title: "Licenses" }} />
    </Stack>
  );
}
