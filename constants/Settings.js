import { Constants } from 'expo';
import { Dimensions } from 'react-native';
import sizeInfo from '../utils/whatAmI';

const Settings = {
  facebookLoginProps: {
    permissions: ['public_profile', 'email', 'user_friends'],
    behavior: sizeInfo.loginBehavior,
  },
  osVersion: sizeInfo.osVersion,
  loginBehavior: sizeInfo.loginBehavior,
  isRunningInExpo: sizeInfo.isRunningInExpo,
  isIPhone: sizeInfo.isIPhone,
  isIPad: sizeInfo.isIPad,
  isIPhoneX: sizeInfo.isIPhoneX,
  bottomInset: sizeInfo.bottomInset,
  topInset: sizeInfo.topInset,
  isSimulator: !Constants.isDevice,
  isFirebaseEnabled: !__DEV__ || true,
  isAutoStartEnabled: !__DEV__ || false,
  isScreenshotEnabled: !__DEV__ || true,
  isMotionMenuEnabled: !__DEV__ || false,
  isComposerEnabled: !__DEV__ || false,
  debug: __DEV__,
  ballDistance: 60,
  rotationSpeed: 4,
  epsilon: 15,
  angleRange: [25, 155],
  visibleTargets: 5,
  ignoredYellowBox: ['Module ABI', `Audio doesn't exist`],
  slug: __DEV__ ? 'crossy-road' : 'users',
  isEveryScoreBest: __DEV__ && false,
  isCacheProfileUpdateActive: !__DEV__ || true,
  shouldDelayFirebaseProfileSyncInMinutes: 25,

  canEditPhoto: false,
};

export default Settings;
