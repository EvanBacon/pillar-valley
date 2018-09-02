import './utils/disableLogs';

import { dispatch } from '@rematch/core';
import React from 'react';
import { View } from 'react-native';

import Assets from './Assets';
import AudioManager from './AudioManager';
import Settings from './constants/Settings';
import AchievementToastProvider from './ExpoParty/AchievementToastProvider';
import Fire from './ExpoParty/Fire';
import Navigation from './Navigation';
import Gate from './rematch/Gate';

import AssetUtils from './universal/AssetUtils'; // eslint-disable-line
import { AppLoading } from './universal/Expo'; // eslint-disable-line
import THREE from './universal/THREE';

console.ignoredYellowBox = Settings.ignoredYellowBox;

export default class App extends React.Component {
  state = { loading: true };

  get loadingScreen() {
    if (Settings.debug) {
      return <View />;
    }
    return <AppLoading />;
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

  get fonts() {
    const items = {};
    const keys = Object.keys(Assets.fonts || {});
    for (const key of keys) {
      const item = Assets.fonts[key];
      const name = key.substr(0, key.lastIndexOf('.'));
      items[name] = item;
    }
    return [items];
  }

  get files() {
    return AssetUtils.arrayFromObject(Assets.images);
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

    await AudioManager.shared.setupAsync();
    console.timeEnd('Startup');
    this.setState({ loading: false });
  };

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
