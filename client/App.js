// import './utils/disableLogs';

import Expo from 'expo';
import AssetUtils from 'expo-asset-utils';
import { THREE } from 'expo-three';
import React from 'react';
import { View } from 'react-native';

import Navigation from './Navigation';
import Assets from './Assets';
import Settings from './constants/Settings';
import AudioManager from './AudioManager';
import Gate from './rematch/Gate';
import Fire from './ExpoParty/Fire';
import AchievementToastProvider from './ExpoParty/AchievementToastProvider';
import { dispatch } from '@rematch/core';

console.ignoredYellowBox = Settings.ignoredYellowBox;

export default class App extends React.Component {
  state = { loading: true };

  get loadingScreen() {
    if (Settings.debug) {
      return <View />;
    } else {
      return <Expo.AppLoading />;
    }
  }

  get screen() {
    return (
      <Gate>
        <AchievementToastProvider>
          <Navigation />
        </AchievementToastProvider>
      </Gate>
    );
  }

  componentWillMount() {
    console.time('Startup');
    THREE.suppressExpoWarnings();
    this._setupExperienceAsync();
  }

  componentDidMount() {
    Fire.shared.init();
    dispatch.locale.getAsync();
  }

  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  _setupExperienceAsync = async () => {
    await Promise.all([this._preloadAsync()]);
    this.setState({ loading: false });
    console.timeEnd('Startup');
    await AudioManager.shared.setupAsync();
  };

  get fonts() {
    let items = {};
    const keys = Object.keys(Assets.fonts || {});
    for (let key of keys) {
      const item = Assets.fonts[key];
      const name = key.substr(0, key.lastIndexOf('.'));
      items[name] = item;
    }
    return [items];
  }

  get files() {
    return AssetUtils.arrayFromObject(Assets.images);
  }

  async _preloadAsync() {
    await AssetUtils.cacheAssetsAsync({
      fonts: this.fonts,
      files: this.files,
    });
  }

  render() {
    return this.state.loading ? this.loadingScreen : this.screen;
  }
}
