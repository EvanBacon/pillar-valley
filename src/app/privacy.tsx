import PrivacyPolicy from "@/components/Privacy";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { Platform } from "react-native";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy | Pillar Valley</title>
      </Head>
      <Stack.Screen
        options={{
          title: "Privacy Policy",

          ...Platform.select({
            default: {},
            ios: {
              headerLargeTitle: true,
              headerTransparent: true,
              headerBlurEffect: "systemChromeMaterialDark",
              headerLargeTitleShadowVisible: false,
              headerShadowVisible: true,
              headerLargeStyle: {
                // NEW: Make the large title transparent to match the background.
                backgroundColor: "transparent",
              },
            },
          }),
        }}
      />

      <PrivacyPolicy />
    </>
  );
}
