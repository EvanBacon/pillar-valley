import { connectActionSheet } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import { router, useRouter } from "expo-router";
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
import { TouchableHighlight } from "react-native-gesture-handler";
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
import { Slate } from "@/src/constants/Colors";

function ActionTypeIcon({ type }: { type: "internal" | "external" }) {
  if (type === "internal") {
    return <FontAwesome color={Slate[500]} size={20} name="angle-right" />;
  } else {
    return <FontAwesome color={Slate[500]} size={20} name="external-link" />;
  }
}

function Item({
  title,
  value,
  onPress,
  top,
  bottom,
  href,
  actionType,
}: {
  href?: string;
  title: string;
  value?: string;
  onPress?: () => void;
  top?: boolean;
  bottom?: boolean;
  actionType?: "external" | "internal";
}) {
  const renderItem = () => {
    if (typeof value !== "undefined") {
      return <Text style={{ fontSize: 16, color: Slate[500] }}>{value}</Text>;
    } else if (onPress) {
      return <ActionTypeIcon type={actionType ?? "internal"} />;
    } else if (href) {
      if (href.startsWith("http")) {
        return <ActionTypeIcon type="external" />;
      } else {
        return <ActionTypeIcon type={actionType ?? "internal"} />;
      }
    }
  };

  return (
    <TouchableHighlight
      style={[
        {
          borderCurve: "continuous",
          backgroundColor: Slate[800],
        },
        top && {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
        bottom && {
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        },
      ]}
      underlayColor={Slate[400]}
      onPress={() => {
        if (href) {
          router.push(href);
        }
        if (onPress) onPress();
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          // padding: 24,
          paddingHorizontal: 16,
          paddingVertical: 14,
          // fontSize: 18,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            color: Slate[100],
            fontSize: 16,
          }}
        >
          {title}
        </Text>
        {renderItem()}
      </View>
    </TouchableHighlight>
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
        Platform.OS === "ios" && {
          title: "🌸 Change App Icon",
          href: "/settings/icon",
        },
        {
          title: "⭐️ Star the project on Github",
          href: "https://github.com/EvanBacon/pillar-valley/stargazers",
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
          title: "⚙️ Open System Settings",
          actionType: "external",
          onPress: () => {
            Linking.openSettings();
          },
        },
        {
          title: "🐛 Report a bug",
          href: "https://github.com/EvanBacon/pillar-valley/issues/new",
        },
        getOtherPlatform() && {
          title: "🌐 Play on another platform",
          actionType: "external",
          onPress: () => {
            openOtherPlatform();
          },
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
          title: "X",
          value: "@baconbrix",
          href: "https://x.com/baconbrix",
        },
        {
          title: "Instagram",
          value: "@baconbrix",
          href: "https://www.instagram.com/baconbrix",
        },

        {
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
          href: "/credit",
        },
        Platform.OS !== "web" && {
          title: "Deep Linking Scheme",
          value: `${Constants.expoConfig?.scheme}://`,
        },
        {
          title: "Expo SDK",
          value: require("@/package.json").dependencies["expo"],
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
          initialNumToRender={30}
          contentContainerStyle={{
            paddingHorizontal: 20,
            // paddingVertical: 40,
            paddingBottom: bottom + 40,
          }}
          stickySectionHeadersEnabled={false}
          // SectionSeparatorComponent={CupertinoItemSeparatorComponent}
          renderSectionHeader={({ section: { title } }) => {
            if (!title) {
              return null;
            }
            return (
              <View
                style={{
                  justifyContent: "flex-end",
                  paddingTop: 32,
                  paddingBottom: 12,
                  paddingLeft: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    textTransform: "uppercase",
                    color: Slate[500],
                    fontWeight: "bold",
                    fontSize: 12,
                    letterSpacing: 1.1,
                  }}
                >
                  {title}
                </Text>
              </View>
            );
          }}
          // renderSectionHeader={({ section: { title } }) => (
          //   <View style={{ backgroundColor: "#282A37" }}>
          //     <Text
          //       style={{
          //         fontFamily: "Inter_500Medium",
          //         padding: 8,
          //         paddingHorizontal: 24,
          //         color: "white",
          //         textTransform: "uppercase",
          //       }}
          //     >
          //       {title}
          //     </Text>
          //   </View>
          // )}
          keyExtractor={(item) => item.title}
          renderItem={({ item, index, section }) => (
            <Item
              {...item}
              top={index === 0}
              bottom={index === section.data.length - 1}
            />
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Slate[900],
  },
});

export function CupertinoItemSeparatorComponent() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Slate[100],
      }}
    >
      <View
        style={{
          marginLeft: ITEM_START_WIDTH,
          height: StyleSheet.hairlineWidth,
          backgroundColor: "#C6C6C8",
        }}
      />
    </View>
  );
}
const ITEM_START_WIDTH = 60;

const BORDER_RADIUS = 10;

export default connectActionSheet(PreferencesScreen);
