import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Device from "expo-device";
import * as Analytics from "expo-firebase-analytics";
import * as Font from "expo-font";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import Head from "expo-router/head";

import React, { useEffect } from "react";
import { Animated, StatusBar, Platform, StyleSheet, View } from "react-native";

import AudioManager from "@/src/AudioManager";
import Fire from "@/src/ExpoParty/Fire";
import TouchableBounce from "@/src/components/TouchableBounce";
import Gate from "@/src/rematch/Gate";

// import { setTestDeviceIDAsync } from "expo-ads-admob";
export const unstable_settings = {
  initialRouteName: "index",
};

// TODO: Customize this
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const loading = useLoadAssets();

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
        image={require("../icons/splash.png")}
      >
        <InnerLayout />
      </AnimatedSplashScreen>
    </>
  );
}
function InnerLayout() {
  const pathname = usePathname();
  useEffect(() => {
    Analytics.logEvent("screen_view", { currentScreen: pathname });
  }, [pathname]);

  const stack = React.useMemo(
    () => (
      <Stack
        screenOptions={{
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: "#F09458",
            borderBottomWidth: 0,
          },
          headerTitleStyle: { color: "white" },
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
          name="credit"
          options={{
            title: "Licenses",
            headerRight: BackButton,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerRight: BackButton,
            presentation: "modal",
          }}
        />
      </Stack>
    ),
    []
  );

  return (
    <Gate>
      <View style={{ backgroundColor: "blue", flex: 1 }}>
        <ActionSheetProvider>{stack}</ActionSheetProvider>
      </View>
    </Gate>
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
  React.useEffect(() => {
    StatusBar.setBarStyle("light-content", true);
    Fire.init();
    (async () => {
      // console.time("Setup");
      const time = getNow();
      try {
        await Promise.all([
          Font.loadAsync({
            "GothamNarrow-Book": require("../src/assets/fonts/GothamNarrow-Book.ttf"),
          }),
          AudioManager.setupAsync(),
        ]);
      } catch (error) {
        console.log("Error loading fonts and audio!");
        Analytics.logEvent("error_loading_assets", { error });
        console.error(error);
      } finally {
        const total = getNow() - time;
        Analytics.logEvent("assets_loaded", { milliseconds: total });
        // console.timeEnd("Setup");
      }
      setLoading(false);
    })();
  }, []);
  return loading;
}

if (Platform.OS !== "web") {
  if (!Device.isDevice) {
    // Disable ads in the emulator / simulator
    // https://docs.expo.io/versions/latest/sdk/admob/#settestdeviceidasynctestdeviceid
    // setTestDeviceIDAsync("EMULATOR");
  }
}

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
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
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
