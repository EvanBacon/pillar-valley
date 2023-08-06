import { connectActionSheet } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import React from "react";
import {
  SectionList,
  Text,
  StyleSheet,
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  openOtherPlatform,
  getOtherPlatform,
} from "@/src/components/Button/SwapPlatformButton";
import useStoreReview from "@/src/hooks/useStoreReview";
import {
  useAchievements,
  useCurrency,
  useRounds,
  useScore,
} from "@/src/rematch/models";
import Head from "expo-router/head";

function Item({
  title,
  value,
  onPress,
}: {
  title: string;
  value?: string;
  onPress?: () => void;
}) {
  const renderItem = () => {
    if (typeof value !== "undefined") {
      return <Text style={{ fontSize: 16, color: "white" }}>{value}</Text>;
    } else if (onPress) {
      return <FontAwesome color="#fff" name="chevron-right" />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (onPress) onPress();
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 24,
        }}
      >
        <Text style={{ fontWeight: "bold", color: "white", fontSize: 16 }}>
          {title}
        </Text>
        {renderItem()}
      </View>
    </TouchableOpacity>
  );
}

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

function PreferencesScreen() {
  const { score, hardResetScore } = useScore();
  const { rounds, bestRounds, resetBestRounds, resetRounds } = useRounds();
  const { currency, resetCurrency } = useCurrency();
  const achievements = useAchievements();

  const router = useRouter();
  const [taps, setTaps] = React.useState(0);
  const { bottom } = useSafeAreaInsets();
  const canReview = useStoreReview();
  const data = [
    {
      title: "Stats",
      data: [
        { title: "Pillars Traversed", value: score.total },
        { title: "Games Played", value: rounds },
        { title: "High score", value: score.best },
        { title: "High score beaten", value: bestRounds },
        { title: "Gems collected", value: currency },
      ],
    },

    {
      title: "Improve Pillar Valley",
      data: [
        canReview && {
          title: "📝 Write a review",
          onPress: () => {
            StoreReview.requestReview();
          },
        },
        {
          title: "⭐️ Star the project on Github",
          onPress: () => {
            Linking.openURL(
              "https://github.com/EvanBacon/pillar-valley/stargazers"
            );
          },
        },
        // Platform.OS !== "web" && {
        //   title: "🎥 Watch an ad",
        //   onPress: async () => {
        //     // Display a rewarded ad
        //     await AdMobRewarded.setAdUnitID(rewardAdUnitId!);
        //     await AdMobRewarded.requestAdAsync();
        //     await AdMobRewarded.showAdAsync();
        //   },
        // },

        Platform.OS !== "web" && {
          title: "Open System Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
        {
          title: "🐛 Report a bug",
          onPress: () => {
            Linking.openURL(
              "https://github.com/EvanBacon/pillar-valley/issues/new"
            );
          },
        },
        getOtherPlatform() && {
          title: "🌐 Play on another platform",
          onPress: () => {
            openOtherPlatform();
          },
        },
      ].filter(Boolean),
    },
    {
      title: "Follow Me 😁",
      data: [
        {
          title: "YouTube",
          value: "Evan Bacon",
          onPress: () => {
            Linking.openURL("https://www.youtube.com/baconbrix");
          },
        },
        {
          title: "Instagram",
          value: "@baconbrix",
          onPress: () => {
            Linking.openURL("https://www.instagram.com/baconbrix");
          },
        },
        {
          title: "Twitter",
          value: "@baconbrix",
          onPress: () => {
            Linking.openURL("https://twitter.com/baconbrix");
          },
        },
        {
          title: "Github",
          value: "EvanBacon",
          onPress: () => {
            Linking.openURL("https://github.com/evanbacon");
          },
        },
      ].filter(Boolean),
    },
    {
      title: "App Info",
      data: [
        {
          title: "Licenses",
          onPress: () => {
            router.push("/credit");
          },
        },
        Platform.OS !== "web" && {
          title: "Deep Linking Scheme",
          value: `${Constants.expoConfig?.scheme}://`,
        },
        {
          title: "Expo SDK",
          value: require("../package.json").dependencies["expo"],
          onPress: () => {
            setTaps((taps) => taps + 1);
          },
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
      <View style={styles.container}>
        <SectionList
          sections={data}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ backgroundColor: "#F09458" }}>
              <Text style={{ padding: 16, color: "white" }}>{title}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: bottom }}
          keyExtractor={(item) => item.title}
          renderItem={({ item, index }) => <Item {...item} />}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282A37",
  },
});

export default connectActionSheet(PreferencesScreen);
