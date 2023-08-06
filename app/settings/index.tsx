import {
  getOtherPlatform,
  openOtherPlatform,
} from "@/src/components/Button/SwapPlatformButton";
import { useSelectedIconSource } from "@/src/components/DynamicIconContext";
import Android from "@/src/components/svg/android";
import AppStoreSvg from "@/src/components/svg/app-store";
import Apple from "@/src/components/svg/apple";
import BrowserSvg from "@/src/components/svg/browser";
import ExpoSvg from "@/src/components/svg/expo";
import GitHubSvg from "@/src/components/svg/github";
import InstagramSvg from "@/src/components/svg/instagram";
import XSvg from "@/src/components/svg/x";
import { Slate } from "@/src/constants/Colors";
import useStoreReview from "@/src/hooks/useStoreReview";
import {
  useAchievements,
  useCurrency,
  useRounds,
  useScore,
} from "@/src/rematch/models";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router, useRouter } from "expo-router";
import Head from "expo-router/head";
import * as StoreReview from "expo-store-review";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView, TouchableHighlight } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ActionTypeIcon({ type }: { type: "internal" | "external" }) {
  if (type === "internal") {
    return (
      <Ionicons color={Slate[500]} size={20} name="chevron-forward-outline" />
    );
  } else {
    return <Ionicons color={Slate[500]} size={20} name="ios-open-outline" />;
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
  leftIcon,
}: {
  href?: string;
  title: string;
  value?: string;
  onPress?: () => void;
  top?: boolean;
  bottom?: boolean;
  leftIcon?: React.ReactNode;
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
      disabled={!onPress && !href}
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {leftIcon}
          {title && (
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                color: Slate[100],
                fontSize: 16,
              }}
            >
              {title}
            </Text>
          )}
        </View>
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

function LeftIconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        borderCurve: "continuous",
        borderRadius: 6,
        padding: 6,
        backgroundColor: Slate["100"],
      }}
    >
      {children}
    </View>
  );
}

function CurrentIconBadge() {
  const src = useSelectedIconSource();
  console.log("src>>", src);
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
      title: "",
      data: [
        Platform.OS === "ios" && {
          leftIcon: <CurrentIconBadge />,
          title: "Customize App Icon",
          href: "/settings/icon",
        },
        canReview && {
          leftIcon: (
            <LeftIconWrapper>
              <AppStoreSvg
                height={14}
                width={14}
                fill={Platform.select({
                  android: "#414141",
                  default: "#0D96F6",
                })}
              />
            </LeftIconWrapper>
          ),
          title: "Write a review",
          onPress: () => {
            StoreReview.requestReview();
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
        {
          leftIcon: (
            <LeftIconWrapper>
              <GitHubSvg height={14} width={14} />
            </LeftIconWrapper>
          ),
          title: "Star the project on Github",
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
        Platform.OS !== "web" && {
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
          value: require("@/package.json").dependencies["expo"],
          onPress: () => {
            setTaps((taps) => taps + 1);
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
      <View style={styles.container}>
        <SectionList
          renderScrollComponent={(props) => <ScrollView {...props} />}
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
            if (title == null) {
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
