import { dispatch } from '@rematch/core';
import firebase from 'firebase';
import React, { Component } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import List from '../components/List';
import Item from '../components/List/Item';
import Settings from '../constants/Settings';
import Fire from '../ExpoParty/Fire';
import { connectActionSheet } from '../universal/ActionSheet';
import { Constants } from '../universal/Expo';

class LeaderboardScreen extends Component {
  state = {
    filter: 'Forever',
    refreshing: false,
    data: {},
    // dataSorted: [],
    // isLoggedIn: false,
  };

  componentDidMount() {
    if (Fire.shared.uid) {
      this.makeRemoteRequest();
    } else {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.makeRemoteRequest();
        }
      });
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
  }

  addChild = (items) => {
    const data = {
      ...this.state.data,
      ...items,
    };
    this.setState({
      data,
      // dataSorted: Object.values(data).sort((a, b) => a.timestamp > b.timestamp),
    });
  };
  //
  makeRemoteRequest = async () => {
    // console.log('makeRemoteRequest', Object.keys(Fire.shared));
    if (!Fire.shared.uid) {
      return;
    }

    if (this.state.refreshing) {
      return;
    }

    const timeout = setTimeout(() => {
      this.setState({ refreshing: false });
    }, 5000);
    this.setState({ refreshing: true });

    dispatch.leaders.getPagedAsync({
      start: this.lastKnownKey,
      size: Settings.leaderPageSize,
      callback: ({ cursor, noMore }) => {
        clearTimeout(timeout);

        this.setState({ noMore, refreshing: false });
        this.lastKnownKey = cursor;
      },
    });
  };

  _onOpenActionSheet = () => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const options = ['Today', 'This Week', 'Forever', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    this.props.showActionSheetWithOptions(
      {
        options,
        icons: ['md-show-chart'],
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          this.setState({ filter: options[buttonIndex] });
        }
        // Do something here depending on the button index selected
      },
    );
  };

  _onPressItem = (item) => {
    // console.log(item);
    this.props.navigation.navigate('Profile', {
      title: item.name,
      ...item,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <List
          noMore={this.state.noMore}
          renderItem={props => <Item onPress={this._onPressItem} {...props} />}
          title="Players"
          headerButtonTitle={this.state.filter}
          data={this.props.leaders}
          userItem={this.props.user}
          onPress={this._onPressItem}
          onPressHeader={this._onOpenActionSheet}
          renderUserItem={() => null}
          onPressFooter={this.makeRemoteRequest}
          refreshControl={
            <RefreshControl
              tintColor={Constants.manifest.primaryColor}
              refreshing={this.state.refreshing}
              onRefresh={this.makeRemoteRequest}
            />
          }
        />
      </View>
    );
  }
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
  const _leadersSorted = Object.values(leaders).sort((a, b) => a.score < b.score);
  return { user, leaders: _leadersSorted };
})(LeaderboardScreen);

export default connectActionSheet(ConnectedProfile);
