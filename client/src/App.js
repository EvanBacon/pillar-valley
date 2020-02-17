import './utils/disableLogs';

import { dispatch } from '@rematch/core';
import React from 'react';
import { View, Text } from 'react-native';

import Assets from './Assets';
import AudioManager from './AudioManager';
import Settings from './constants/Settings';
import AchievementToastProvider from './ExpoParty/AchievementToastProvider';
import Fire from './ExpoParty/Fire';
import Navigation from './Navigation';
import Gate from './rematch/Gate';

import AssetUtils from 'expo-asset-utils'; // eslint-disable-line
import { AppLoading } from 'expo';

console.ignoredYellowBox = Settings.ignoredYellowBox;

export default class App extends React.Component {
  state = { loading: true };

  getLoadingScreen = () => {
    if (Settings.debug) {
      return <View />;
    }
    return <AppLoading />;
  };

  getScreen = () => {
    return (
      <Gate>
        <AchievementToastProvider>
          <Navigation />
        </AchievementToastProvider>
      </Gate>
    );
  };

  getFonts = () => {
    const items = {};
    const keys = Object.keys(Assets.fonts || {});
    for (const key of keys) {
      const item = Assets.fonts[key];
      const name = key.substr(0, key.lastIndexOf('.'));
      items[name] = item;
    }
    return [items];
  };

  getFiles = () => {
    return AssetUtils.arrayFromObject(Assets.images);
  };

  componentWillMount() {
    console.time('Startup');
    this._setupExperienceAsync();
  }

  componentDidMount() {
    Fire.shared.init();
    dispatch.locale.getAsync();
  }

  _setupExperienceAsync = async () => {
    try {
      await Promise.all([this._preloadAsync()]);
      await AudioManager.shared.setupAsync();
    } catch (error) {
      console.log(error);
    } finally {
      console.timeEnd('Startup');
      this.setState({ loading: false });
    }
  };

  async _preloadAsync() {
    await AssetUtils.cacheAssetsAsync({
      fonts: this.getFonts(),
      files: this.getFiles(),
    });
  }

  render() {
    console.log('loading', this.state.loading);
    return this.state.loading ? this.getLoadingScreen() : this.getScreen();
  }
}
