'use strict';

import { connectActionSheet } from '@expo/react-native-action-sheet';
import React, { Component } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import firebase from 'firebase';
import Item from '../components/List/Item';
import List from '../components/List';
import addNth from '../utils/addNth';
import Fire from '../Fire';
import { Constants } from 'expo';
const data = [
  {
    name: 'Evan Bacon',
    score: 1546,
    image: null,
  },
  {
    name: 'Harambe',
    score: 1500,
    image: null,
  },
  {
    name: 'Tekashi',
    score: 1496,
    image: null,
  },
  {
    name: 'Trippie',
    score: 1453,
    image: null,
  },
  {
    name: 'Willy',
    score: 1421,
    image: null,
  },
  {
    name: 'Jonas Brothers fan',
    score: 1412,
    image: null,
  },
].map((user, index) => {
  const rank = index + 1;

  return {
    ...user,
    rank: rank + addNth(rank),
  };
});

const PAGE_SIZE = 5;
class App extends Component {
  static navigationOptions = {};

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
    console.log(item);
    // this.props.navigation.navigate('Report', {
    //   title: item.name,
    //   ...item,
    // });
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
    // if (DEBUG) {
    //   return;
    // }

    let timeout = setTimeout(() => {
      this.setState({ refreshing: false });
    }, 5000);
    if (this.state.refreshing) {
      return;
    }
    this.setState({ refreshing: true });
    const { data, cursor } = await Fire.shared.getPagedScore({
      size: PAGE_SIZE,
      start: this.lastKnownKey,
    });
    this.lastKnownKey = cursor;

    // console.log('Got data', JSON.stringify(data));
    let items = {};
    for (let child of data) {
      child.name = child.name || child.title || 'Mystery Duck';
      items[child.key] = child;
    }
    this.addChild(items);
    clearTimeout(timeout);

    this.setState({ refreshing: false });
  };

  render() {
    return (
      <View style={styles.container}>
        <List
          renderItem={props => <Item onPress={this._onPressItem} {...props} />}
          title={'Players'}
          headerButtonTitle={this.state.filter}
          data={this.state.dataSorted}
          userItem={this.props.user}
          onPress={this._onPressItem}
          onPressHeader={this._onOpenActionSheet}
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

import { connect } from 'react-redux';

const ConnectedProfile = connect(({ user }) => ({ user }))(App);

export default connectActionSheet(ConnectedProfile);
