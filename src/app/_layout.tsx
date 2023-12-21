import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Device from "expo-device";
import * as Font from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Animated, StatusBar, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Slate } from "../constants/Colors";

import AudioManager from "@/AudioManager";
import Fire from "@/ExpoParty/Fire";
import DynamicIconProvider from "@/components/DynamicIconContext";
import TouchableBounce from "@/components/TouchableBounce";
import { useDynamicQuickActions } from "@/hooks/useQuickActions";
import { useUpdatedUpdatesInfoInSettings } from "@/hooks/useUpdatesInAppleSettings";
import { logEvent } from "@/lib/Analytics";
import { useSyncGlobalAudioWithSettings } from "@/zustand/models";

if (Platform.OS !== "web") {
  const { vexo } = require("vexo-analytics");

  vexo("52b377af-bf1d-432d-aac2-2859d2c153d6");
}
// import { setTestDeviceIDAsync } from "expo-ads-admob";
export const unstable_settings = {
  initialRouteName: "index",
};

// TODO: Customize this
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const loading = useLoadAssets();
  useUpdatedUpdatesInfoInSettings();
  useSyncGlobalAudioWithSettings();

  return (
    <>
      <Head>
        <meta property="og:title" content="Pillar Valley" />
        <meta property="expo:handoff" content="true" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#F09458" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <AnimatedSplashScreen
        loading={loading}
        image={require("icons/splash.png")}
      >
        <DynamicIconProvider>
          <InnerLayout />
        </DynamicIconProvider>
      </AnimatedSplashScreen>
    </>
  );
}
function InnerLayout() {
  const pathname = usePathname();
  useDynamicQuickActions();
  useEffect(() => {
    logEvent("screen_view", { currentScreen: pathname });
  }, [pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActionSheetProvider>
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

            contentStyle: {
              backgroundColor: Slate[900],
            },

            headerTitleStyle: {
              color: "white",
              fontFamily: "Inter_500Medium",
            },
          }}
        >
          <Stack.Screen name="index" options={{ header: () => null }} />
          <Stack.Screen
            name="challenges"
            options={{
              title: "Challenges",
              headerRight: BackButton,
              presentation: "modal",
            }}
          />

          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              title: "Privacy",
              headerRight: BackButton,
              presentation: "modal",
            }}
          />
        </Stack>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}

function BackButton() {
  const router = useRouter();
  if (Platform.OS === "web") {
    return null;
  }
  return (
    <TouchableBounce onPress={() => router.back()}>
      <FontAwesome size={24} color="white" name="angle-down" />
    </TouchableBounce>
  );
}

function useLoadAssets() {
  const [loading, setLoading] = React.useState(true);
  const [fonts, error] = Font.useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
    Inter_400Regular: require("@/assets/fonts/Inter_400Regular.ttf"),
    Inter_500Medium: require("@/assets/fonts/Inter_500Medium.ttf"),
  });

  React.useEffect(() => {
    if (error) {
      console.log("Error loading fonts");
      logEvent("error_loading_fonts", { error: error.message });
      console.error(error);
    }
  }, [error]);

  React.useEffect(() => {
    StatusBar.setBarStyle("light-content", true);
    Fire.init();
    (async () => {
      // console.time("Setup");
      const time = getNow();
      try {
        await AudioManager.setupAsync();
      } catch (error: any) {
        console.log("Error loading audio");
        logEvent("error_loading_assets", { error: error.message });
        console.error(error);
      } finally {
        const total = getNow() - time;
        logEvent("assets_loaded", { milliseconds: total });
        // console.timeEnd("Setup");
      }
      setLoading(false);
    })();
  }, []);

  return loading && fonts;
}

if (Platform.OS !== "web") {
  if (!Device.isDevice) {
    // Disable ads in the emulator / simulator
    // https://docs.expo.io/versions/latest/sdk/admob/#settestdeviceidasynctestdeviceid
    // setTestDeviceIDAsync("EMULATOR");
  }
}

// [
//   {
//     "title": "New Chat",
//     "icon": "compose",
//     "id": "0",
//     "params": { "href": "/compose" },
//   },
//   {
//     "title": "Reply to Lydia",
//     "subtitle": "Explain React Server Components plz",
//     "icon": "contact",
//     "id": "1",
//     "params": { "href": "/messages/theavocoder" },
//   },
//   {
//     "title": "Search",
//     "icon": "search",
//     "id": "3",
//     "params": { "href": "/search" },
//   },
//   {
//     "title": "Leave Feedback",
//     "subtitle": "Please provide feedback before deleting the app",
//     "icon": "symbol:envelope",
//     "id": "4",
//     "params": { "href": "mailto:support@myapp.dev" },
//   }
function AnimatedSplashScreen({ children, loading, image }) {
  const animation = React.useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = React.useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] =
    React.useState(false);

  useEffect(() => {
    if (isAppReady && !loading) {
      SplashScreen.hideAsync();

      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady, loading]);

  const onImageLoaded = React.useCallback(async () => {
    setAppReady(true);
  }, []);

  if (Platform.OS === "web") {
    return children;
  }

  return (
    <>
      {children}

      {!isSplashAnimationComplete && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              pointerEvents: "none",
              backgroundColor: "#F09458",
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2.5, 1],
                  }),
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </>
  );
}

// @ts-ignore
const getNow = global.nativePerformanceNow ?? Date.now;
