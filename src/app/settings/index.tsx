import { connectActionSheet } from "@expo/react-native-action-sheet";
import Constants from "expo-constants";
import Head from "expo-router/head";
import * as StoreReview from "expo-store-review";
import React from "react";
import { Alert, Image, Linking, Platform } from "react-native";

import {
  getOtherPlatform,
  openOtherPlatform,
} from "@/components/Button/SwapPlatformButton";
import { CustomList, LeftIconWrapper } from "@/components/CustomList";
import { useSelectedIconSource } from "@/components/DynamicIconContext";
import Android from "@/components/svg/android";
import AppStoreSvg from "@/components/svg/app-store";
import Apple from "@/components/svg/apple";
import BrowserSvg from "@/components/svg/browser";
import ExpoSvg from "@/components/svg/expo";
import GitHubSvg from "@/components/svg/github";
import InstagramSvg from "@/components/svg/instagram";
import XSvg from "@/components/svg/x";
import { Slate } from "@/constants/Colors";
import useStoreReview from "@/hooks/useStoreReview";
import {
  useAchievements,
  useCurrency,
  useRounds,
  useScore,
} from "@/zustand/models";
import * as AppIcon from "expo-quick-actions/icon";

function areYouSureAsync(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "🛑 Are you sure?",
      undefined,
      [
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            resolve(true);
          },
        },
        {
          text: "Nevermind 🤷‍♂️",
          style: "cancel",
          onPress: () => {
            resolve(false);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

function CurrentIconBadge() {
  const src = useSelectedIconSource();
  const size = 14 + 12;
  return (
    <Image
      style={{
        height: size,
        width: size,
        // borderCurve: "continuous",
        borderRadius: 6,

        backgroundColor: Slate["100"],
      }}
      resizeMode="cover"
      source={src}
    />
  );
}

function PreferencesScreen() {
  const { score, hardResetScore } = useScore();
  const { rounds, bestRounds, resetBestRounds, resetRounds } = useRounds();
  const { resetCurrency } = useCurrency();
  const achievements = useAchievements();
  const [taps, setTaps] = React.useState(0);
  const canReview = useStoreReview();
  const data = [
    {
      title: "Stats",
      data: [
        { title: "Pillars Traversed", value: score.total },
        { title: "Games Played", value: rounds },
        { title: "High score", value: score.best },
        { title: "High score beaten", value: bestRounds },
        // { title: "Gems collected", value: currency },
        // {
        //   title: "Test Achievement",
        //   value: require("package.json").dependencies["expo"],
        //   onPress: () => {
        //     achievements.resetAchievements();
        //     achievements.unlock("rounds-10");
        //   },
        // },
      ],
    },
    {
      title: "Extras",
      data: [
        AppIcon.isSupported && {
          leftIcon: <CurrentIconBadge />,
          title: "Customize App Icon",
          href: "/settings/icon",
        },

        // process.env.EXPO_OS !== "web" && {
        //   title: "🎥 Watch an ad",
        //   onPress: async () => {
        //     // Display a rewarded ad
        //     await AdMobRewarded.setAdUnitID(rewardAdUnitId!);
        //     await AdMobRewarded.requestAdAsync();
        //     await AdMobRewarded.showAdAsync();
        //   },
        // },

        getOtherPlatform() && {
          leftIcon: (
            <LeftIconWrapper>
              <BrowserSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Play on another platform",
          actionType: "external",
          onPress: () => {
            openOtherPlatform();
          },
        },
        canReview && {
          leftIcon: (
            <LeftIconWrapper>
              <AppStoreSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Write a review",
          onPress: () => {
            StoreReview.requestReview();
          },
        },
        {
          leftIcon: (
            <LeftIconWrapper>
              <GitHubSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Star on Github",
          href: "https://github.com/EvanBacon/pillar-valley/stargazers",
        },
        {
          leftIcon: (
            <LeftIconWrapper>
              <GitHubSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Report a bug",
          href: "https://github.com/EvanBacon/pillar-valley/issues/new",
        },
      ].filter(Boolean),
    },
    {
      title: "Follow",
      data: [
        // {
        //   title: "YouTube",
        //   value: "Evan Bacon",
        //   onPress: () => {
        //     Linking.openURL("https://www.youtube.com/baconbrix");
        //   },
        // },
        {
          leftIcon: (
            <LeftIconWrapper>
              <XSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "X",
          value: "@baconbrix",
          href: "https://x.com/baconbrix",
        },
        {
          leftIcon: (
            <LeftIconWrapper>
              <InstagramSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Instagram",
          value: "@baconbrix",
          href: "https://www.instagram.com/baconbrix",
        },

        {
          leftIcon: (
            <LeftIconWrapper>
              <GitHubSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Github",
          value: "EvanBacon",
          href: "https://github.com/evanbacon",
        },
      ].filter(Boolean),
    },
    {
      title: "App Info",
      data: [
        {
          title: "Licenses",
          href: "/settings/licenses",
        },
        process.env.EXPO_OS !== "web" && {
          title: "Deep Linking Scheme",
          value: `${Constants.expoConfig?.scheme}://`,
        },

        Platform.select({
          web: null,
          ios: {
            title: "Bundle ID",
            value: Constants.expoConfig?.ios?.bundleIdentifier,
          },
          android: {
            title: "Package Name",
            value: Constants.expoConfig?.android?.["package"],
          },
        }),
        {
          leftIcon: (
            <LeftIconWrapper>
              <ExpoSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Expo SDK",
          value: require("package.json").dependencies["expo"],
          onPress: () => {
            setTaps((taps) => taps + 1);
          },
        },
        process.env.EXPO_OS !== "web" && {
          leftIcon: (
            <LeftIconWrapper>
              {Platform.select({
                ios: <Apple height={14} width={14} />,
                android: <Android height={14} width={14} />,
              })}
            </LeftIconWrapper>
          ),
          title: "Open System Settings",
          actionType: "external",
          onPress: () => {
            Linking.openSettings();
          },
        },
      ].filter(Boolean),
    },
    taps > 10 && {
      title: "Secret Menu",
      data: [
        {
          title: "Reset Stats",
          value: "This cannot be undone",
          onPress: async () => {
            if (await areYouSureAsync()) {
              hardResetScore();

              resetBestRounds();
              resetRounds();
              resetCurrency();
            }
          },
        },
        {
          title: "Reset Achievements",
          value: "This cannot be undone",
          onPress: async () => {
            if (await areYouSureAsync()) {
              achievements.resetAchievements();
              // dispatch.achievements._reset();
            }
          },
        },
      ],
    },
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>Settings</title>
        <meta property="og:title" content="Settings | Pillar Valley" />
      </Head>
      <CustomList sections={data} />
    </>
  );
}

export default connectActionSheet(PreferencesScreen);
