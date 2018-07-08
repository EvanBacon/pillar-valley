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
if (__DEV__) {
  console.ignoredYellowBox = Settings.ignoredYellowBox;
}

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
        <Navigation />
      </Gate>
    );
  }

  componentWillMount() {
    THREE.suppressExpoWarnings();
    this._setupExperienceAsync();
  }
  componentDidMount() {
    Fire.shared.init();
  }

  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  _setupExperienceAsync = async () => {
    await Promise.all([this._preloadAsync(), AudioManager.shared.setupAsync()]);
    this.setState({ loading: false });
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
