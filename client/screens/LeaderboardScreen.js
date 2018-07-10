import { connectActionSheet } from '@expo/react-native-action-sheet';
import { dispatch } from '@rematch/core';
import { Constants } from 'expo';
import firebase from 'firebase';
import React, { Component } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import List from '../components/List';
import Item from '../components/List/Item';
import Settings from '../constants/Settings';
import Fire from '../ExpoParty/Fire';

class LeaderboardScreen extends Component {
  state = {
    filter: 'Forever',
    refreshing: false,
    data: {},
    dataSorted: [],
    isLoggedIn: false,
  };

  _onOpenActionSheet = () => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    let options = ['Today', 'This Week', 'Forever', 'Cancel'];
    let destructiveButtonIndex = 0;
    let cancelButtonIndex = options.length - 1;

    this.props.showActionSheetWithOptions(
      {
        options,
        icons: ['md-show-chart'],
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          this.setState({ filter: options[buttonIndex] });
        }
        // Do something here depending on the button index selected
      },
    );
  };

  _onPressItem = item => {
    // console.log(item);
    this.props.navigation.navigate('Profile', {
      title: item.name,
      ...item,
    });
  };

  componentDidMount() {
    if (Fire.shared.uid) {
      this.makeRemoteRequest();
    } else {
      firebase.auth().onAuthStateChanged(user => {
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

  addChild = items => {
    const data = {
      ...this.state.data,
      ...items,
    };
    this.setState({
      data,
      dataSorted: Object.values(data).sort((a, b) => a.timestamp > b.timestamp),
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

    let timeout = setTimeout(() => {
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

  render() {
    return (
      <View style={styles.container}>
        <List
          noMore={this.state.noMore}
          renderItem={props => <Item onPress={this._onPressItem} {...props} />}
          title={'Players'}
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
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});

const ConnectedProfile = connect(({ user, leaders }) => {
  const _leadersSorted = Object.values(leaders).sort(
    (a, b) => a.score < b.score,
  );
  return { user, leaders: _leadersSorted };
})(LeaderboardScreen);

export default connectActionSheet(ConnectedProfile);
