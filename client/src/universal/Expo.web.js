import UAParser from 'ua-parser-js';

import app from '../../app.json';
import GLView from './GLView';

Audio.prototype.playAsync = function () {
  this.play();
};
Audio.prototype.pauseAsync = function () {
  this.pause();
};
Audio.prototype.stopAsync = function () {
  this.pause();
  this.currentTime = 0;
};
Audio.prototype.setIsLoopingAsync = function () {
  // TODO:Bacon: add this
};
Audio.prototype.setPositionAsync = function (currentTime) {
  this.currentTime = currentTime;
};
Audio.prototype.setVolumeAsync = function () {};
const parser = new UAParser();
const { browser, engine, os: OS } = parser.getResult();

module.exports = {
  GLView,
  Haptic: {},
  takeSnapshotAsync: () => ({}),
  Audio: {
    setAudioModeAsync: () => {},
    Sound: {
      create: (res) => {
        const sound = new Audio(res);
        return { sound };
      },
    },
  },
  Constants: {
    appOwnership: 'web',
    manifest: app.expo,
    expoVersion: app.expo.expoVersion,
    deviceId: JSON.stringify(parser.getResult()),
    deviceName: `${browser.name || engine.name || OS.name}-kid`,
    deviceYearClass: null,
    isDevice: true,
    platform: {
      web: {},
    },
  },
  StoreReview: {
    isSupported: () => false,
    hasAction: () => false,
  },
  ImagePicker: {},
  Permissions: {},
  AppLoading: {},
  Facebook: {
    logInWithReadPermissionsAsync: () => null,
  },
  DangerZone: {
    DeviceMotion: {},
  },
};
