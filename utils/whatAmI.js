///From Here: https://github.com/react-community/react-native-safe-area-view/blob/master/index.js

import { Dimensions, DeviceInfo, NativeModules, Platform } from 'react-native';
import StatusBarHeight from '@expo/status-bar-height';
import { Constants } from 'expo';

const { PlatformConstants = {} } = NativeModules;
const { minor = 0 } = PlatformConstants.reactNativeVersion || {};

const isRunningInExpo = Constants.appOwnership === 'expo';

const isIPhone = Platform.OS === 'ios';

const X_WIDTH = 375;
const X_HEIGHT = 812;
const PAD_WIDTH = 768;
const PAD_HEIGHT = 1024;
const isIPhoneX = (() => {
  if (Platform.OS === 'web') return false;

  if (minor >= 50) {
    return DeviceInfo.isIPhoneX_deprecated;
  }

  return (
    Platform.OS === 'ios' &&
    ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
      (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))
  );
})();

const isIPad = (() => {
  if (Platform.OS !== 'ios' || isIPhoneX) return false;

  // if portrait and width is smaller than iPad width
  if (D_HEIGHT > D_WIDTH && D_WIDTH < PAD_WIDTH) {
    return false;
  }

  // if landscape and height is smaller that iPad height
  if (D_WIDTH > D_HEIGHT && D_HEIGHT < PAD_WIDTH) {
    return false;
  }

  return true;
})();

const statusBarHeight = isLandscape => {
  if (_customStatusBarHeight !== null) {
    return _customStatusBarHeight;
  }

  /**
   * This is a temporary workaround because we don't have a way to detect
   * if the status bar is translucent or opaque. If opaque, we don't need to
   * factor in the height here; if translucent (content renders under it) then
   * we do.
   */
  if (Platform.OS === 'android') {
    return StatusBarHeight.height;
  }

  if (isIPhoneX) {
    return isLandscape ? 0 : 44;
  }

  if (isIPad) {
    return StatusBarHeight.height;
  }

  return isLandscape ? 0 : StatusBarHeight.height;
};

const getInset = (key, isLandscape) => {
  switch (key) {
    case 'horizontal':
    case 'right':
    case 'left': {
      return isLandscape ? (isIPhoneX ? 44 : 0) : 0;
    }
    case 'vertical':
    case 'top': {
      return statusBarHeight(isLandscape);
    }
    case 'bottom': {
      return isIPhoneX ? (isLandscape ? 24 : 34) : 0;
    }
  }
};

export default {
  isIPhoneX: isIPhoneX,
  isIPad: isIPhoneX,
  isRunningInExpo,
  isIPhone,
  statusBarHeight: StatusBarHeight.height,
  bottomInset: getInset('bottom', false),
  topInset: isIPhoneX ? 34 : 0,
  getInset,
};
