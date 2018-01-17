import Expo from 'expo';
import React, { Component } from 'react';
import { Animated, Dimensions, FlatList } from 'react-native';

import Fire from '../../Fire';
import Footer from './Footer';
import Item from './Item';

const { width } = Dimensions.get('window');
const itemHeight = 64;
const gutter = 4;
const totalGutter = gutter * 2;
const itemSize = itemHeight + totalGutter;
const PAGE_SIZE = 5;
const DEBUG = false;

class App extends Component {
  items = [];
  lastKnownKey = null;
  _scrollValue = 0;

  constructor(props) {
    super(props);

    this.scrollValue = new Animated.Value(0);
    this.scrollValue.addListener(({ value }) => (this._scrollValue = value));

    this.onScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { x: this.scrollValue } } }],
      {
        useNativeDriver: false,
      },
    );

    this.state = {
      loading: false,
      data: {},
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
    };
  }

  addChild = item => {
    this.setState(previousState => ({
      data: {
        ...previousState.data,
        [item.key]: item,
      },
    }));
  };

  makeRemoteRequest = async () => {
    if (DEBUG) {
      return;
    }

    if (this.state.loading) {
      return;
    }

    this.setState({ loading: true });
    const { data, cursor } = await Fire.shared.getPagedScore({
      size: PAGE_SIZE,
      start: this.lastKnownKey,
    });

    this.lastKnownKey = cursor;

    for (let child of data) {
      this.addChild(child);
    }
    this.setState({ loading: false });
  };

  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        seed: this.state.seed + 1,
        refreshing: true,
      },
      () => {
        this.makeRemoteRequest();
      },
    );
  };

  handleLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1,
      },
      () => {
        this.makeRemoteRequest();
      },
    );
  };

  getCurrentIndex = () => Math.round(this._scrollValue / itemSize);

  renderItem = ({ item }) => (
    <Item
      title={item.title}
      gutter={gutter}
      subtitle={item.score}
      backgroundColor={item.uid === Fire.shared.uid ? '#F4E1DB' : '#ffffff'}
      itemHeight={itemHeight}
      score={item.score}
    />
  );

  getItemLayout = (data, index) => ({
    length: itemSize,
    offset: itemSize * index,
    index,
  });

  render() {
    const data = Object.keys(this.state.data).map(key => this.state.data[key]);

    // const data = [
    //   {
    //     appOwnership: 'expo',
    //     deviceId: 'AA5E2DFC-C6C7-4E1E-BA0D-54077C5F362F',
    //     deviceName: " Evan's iPhone 7 Plus",
    //     deviceYearClass: 2016,
    //     expoVersion: '2.2.1.1011991',
    //     isDevice: true,
    //     key: '1fAEJHd0K6YEOeAEU6WKqtbzdex2',
    //     platform: {
    //       ios: {
    //         model: 'iPhone 7 Plus',
    //         platform: 'iPhone9,4',
    //         systemVersion: '11.2.2',
    //         userInterfaceIdiom: 'handset',
    //       },
    //     },
    //     score: 12,
    //     slug: 'nitro-roll',
    //     title: " Evan's iPhone 7 Plus",
    //     uid: '1fAEJHd0K6YEOeAEU6WKqtbzdex2',
    //   },
    //   {
    //     appOwnership: 'expo',
    //     deviceId: 'AA5E2DFC-C6C7-4E1E-BA0D-54077C5F362F',
    //     deviceName: " Evan's iPhone 7 Plus",
    //     deviceYearClass: 2016,
    //     expoVersion: '2.2.1.1011991',
    //     isDevice: true,
    //     key: 'someotherid',
    //     platform: {
    //       ios: {
    //         model: 'iPhone 7 Plus',
    //         platform: 'iPhone9,4',
    //         systemVersion: '11.2.2',
    //         userInterfaceIdiom: 'handset',
    //       },
    //     },
    //     score: 10,
    //     slug: 'nitro-roll',
    //     timestamp: 1516149896164,
    //     title: " Evan's iPhone 7 Plus",
    //     uid: 'someotherid',
    //   },
    //   {
    //     appOwnership: 'expo',
    //     deviceId: 'AA5E2DFC-C6C7-4E1E-BA0D-54077C5F362F',
    //     deviceName: " Evan's iPhone 7 Plus",
    //     deviceYearClass: 2016,
    //     expoVersion: '2.2.1.1011991',
    //     isDevice: true,
    //     key: 'someotheridb',
    //     platform: {
    //       ios: {
    //         model: 'iPhone 7 Plus',
    //         platform: 'iPhone9,4',
    //         systemVersion: '11.2.2',
    //         userInterfaceIdiom: 'handset',
    //       },
    //     },
    //     score: 15,
    //     slug: 'nitro-roll',
    //     timestamp: 1516149927413,
    //     title: " Evan's iPhone 7 Plus",
    //     uid: 'someotheridb',
    //   },
    //   {
    //     appOwnership: 'expo',
    //     deviceId: 'AA5E2DFC-C6C7-4E1E-BA0D-54077C5F362F',
    //     deviceName: " Evan's iPhone 7 Plus",
    //     deviceYearClass: 2016,
    //     expoVersion: '2.2.1.1011991',
    //     isDevice: true,
    //     key: 'someotheridc',
    //     platform: {
    //       ios: {
    //         model: 'iPhone 7 Plus',
    //         platform: 'iPhone9,4',
    //         systemVersion: '11.2.2',
    //         userInterfaceIdiom: 'handset',
    //       },
    //     },
    //     score: 20,
    //     slug: 'nitro-roll',
    //     timestamp: 1516149937335,
    //     title: " Evan's iPhone 7 Plus",
    //     uid: 'someotheridc',
    //   },
    // ];

    return (
      <FlatList
        onScroll={this.onScroll}
        ref={ref => (this.list = ref)}
        keyExtractor={(item, index) => index}
        data={data}
        getItemLayout={this.getItemLayout}
        renderItem={this.renderItem}
        ListFooterComponent={
          <Footer hasMore={true} isLoading={this.state.loading} />
        }
        ListHeaderComponent={this.renderHeader}
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={10}
      />
    );
  }
}

export default App;
