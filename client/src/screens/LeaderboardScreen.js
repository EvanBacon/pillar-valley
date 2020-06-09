import { dispatch } from "@rematch/core";
import firebase from "firebase/app";
import "firebase/auth";
import React, { Component } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { connect } from "react-redux";

import List from "../components/List";
import Item from "../components/List/Item";
import Settings from "../constants/Settings";
import Fire from "../ExpoParty/Fire";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import Constants from "expo-constants";

function useCurrentUser() {
  const [user, setUser] = React.useState(firebase.auth().currentUser);
  React.useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsub();
  }, []);
  return user;
}

function LeaderboardScreen({
  showActionSheetWithOptions,
  user,
  leaders,
  navigation,
}) {
  const [filter, setFilter] = React.useState("Forever");
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState({});
  const [hasMore, setHasMore] = React.useState(true);
  const [lastKnownKey, setLast] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      makeRemoteRequest();
    }

    // this._onPressItem({
    //   key: 'gUdfd7VmKyWHR84G3tvB9NkYH0b2',
    //   appOwnership: 'expo',
    //   dailyVisits: 0,
    //   deviceId: 'F56CB29A-581A-4517-B3C8-3BDA0D2A5E3B',
    //   deviceName: 'Bingo Boi',
    //   deviceYearClass: 2016,
    //   expoVersion: '2.5.0.1014340',
    //   isDevice: true,
    //   lastRewardTimestamp: 1524166289798,
    //   platform: {
    //     ios: {
    //       buildNumber: '2.5.0.1014340',
    //       model: 'iPhone 7 Plus',
    //       platform: 'iPhone9,4',
    //       systemVersion: '11.2.6',
    //       userInterfaceIdiom: 'handset',
    //     },
    //   },
    //   score: 3,
    //   slug: 'crossy-road',
    //   uid: 'gUdfd7VmKyWHR84G3tvB9NkYH0b2',
    //   title: 'Bingo Boi',
    //   name: 'Bingo Boi',
    //   rank: 2,
    // });
  }, [(user || {}).uid]);

  const addChild = (items) => {
    setData({
      ...data,
      ...items,
    });
  };

  const makeRemoteRequest = async () => {
    // console.log('makeRemoteRequest', Object.keys(Fire.shared));
    if (!Fire.shared.uid) {
      return;
    }

    if (refreshing) {
      return;
    }

    // Create a timer
    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, 5000);
    setRefreshing(true);

    dispatch.leaders.getPagedAsync({
      start: lastKnownKey,
      size: Settings.leaderPageSize,
      callback: ({ cursor, noMore }) => {
        clearTimeout(timeout);

        setRefreshing(false);
        setHasMore(!noMore);
        setLast(cursor);
      },
    });
  };

  const _onOpenActionSheet = () => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const options = ["Today", "This Week", "Forever", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        icons: ["md-show-chart"],
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          setFilter(options[buttonIndex]);
        }
        // Do something here depending on the button index selected
      }
    );
  };

  const _onPressItem = (item) => {
    // console.log(item);
    navigation.navigate("Profile", {
      title: item.name,
      ...item,
    });
  };

  return (
    <View style={styles.container}>
      <List
        noMore={!hasMore}
        renderItem={(props) => <Item onPress={_onPressItem} {...props} />}
        title="Players"
        headerButtonTitle={filter}
        data={leaders}
        userItem={user}
        onPress={_onPressItem}
        onPressHeader={_onOpenActionSheet}
        renderUserItem={() => null}
        onPressFooter={makeRemoteRequest}
        refreshControl={
          <RefreshControl
            tintColor={Constants.manifest.primaryColor}
            refreshing={refreshing}
            onRefresh={makeRemoteRequest}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingTop: Constants.statusBarHeight,
    // backgroundColor: '#ecf0f1',
  },
});

const ConnectedProfile = connect(({ user, leaders }) => {
  const _leadersSorted = Object.values(leaders).sort(
    (a, b) => a.score < b.score
  );
  return { user, leaders: _leadersSorted };
})(LeaderboardScreen);

export default connectActionSheet(ConnectedProfile);
