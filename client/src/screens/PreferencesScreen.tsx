import { connectActionSheet } from "@expo/react-native-action-sheet";
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
import { connect } from "react-redux";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as StoreReview from "expo-store-review";
import useStoreReview from "../hooks/useStoreReview";
import {
  openOtherPlatform,
  getOtherPlatform,
} from "../components/Button/SwapPlatformButton";
import { AdMobRewarded } from "expo-ads-admob";
import { rewardAdUnitId } from "../constants/Ads";
import { dispatch } from "../rematch/store";

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
      return <Text style={{ fontSize: 16 }}>{value}</Text>;
    } else if (onPress) {
      return <FontAwesome name="chevron-right" />;
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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{title}</Text>
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

function PreferencesScreen({
  score,
  rounds,
  currency,
  bestRounds,
  navigation,
}) {
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
        { title: "Gems collected", value: currency.current },
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
            navigation.navigate("Licenses");
          },
        },
        Platform.OS !== "web" && {
          title: "Deep Linking Scheme",
          value: `${Constants.manifest.scheme}://`,
        },
        {
          title: "Expo SDK",
          value: require("../../package.json").dependencies["expo"],
          onPress: () => {
            setTaps((taps) => taps + 1);
          },
        },
        Platform.select({
          web: null,
          ios: {
            title: "Bundle ID",
            value: Constants.manifest?.ios?.bundleIdentifier,
          },
          android: {
            title: "Package Name",
            value: Constants.manifest?.android?.["package"],
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
              dispatch.score._hardReset();
              dispatch.storeReview._reset();
              dispatch.rounds._reset();
              dispatch.bestRounds._reset();
              dispatch.currency._reset();
            }
          },
        },
        {
          title: "Reset Achievements",
          value: "This cannot be undone",
          onPress: async () => {
            if (await areYouSureAsync()) {
              dispatch.achievements._reset();
            }
          },
        },
      ],
    },
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <SectionList
        sections={data}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ backgroundColor: "#E07C4C" }}>
            <Text style={{ padding: 16, color: "white" }}>{title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: bottom }}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => <Item {...item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
});

const ConnectedScreen = connect(({ score, rounds, bestRounds, currency }) => ({
  score,
  rounds,
  bestRounds,
  currency,
}))(PreferencesScreen);

export default connectActionSheet(ConnectedScreen);
