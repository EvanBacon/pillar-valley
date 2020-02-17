// @flow
import Constants from 'expo-constants'; 
import { Dimensions, Platform } from 'react-native';
import sizeInfo from '../utils/whatAmI';

const debug = __DEV__;
const Settings = {
  facebookLoginProps: {
    permissions: [
      'public_profile',
      'email',
      // 'user_friends'
    ],
  },
  circleEnabled: false,
  isIos: Platform.OS === 'ios',
  osVersion: sizeInfo.osVersion,
  loginBehavior: sizeInfo.loginBehavior,
  isRunningInExpo: sizeInfo.isRunningInExpo,
  isIPhone: sizeInfo.isIPhone,
  isIPad: sizeInfo.isIPad,
  isIPhoneX: sizeInfo.isIPhoneX,
  bottomInset: sizeInfo.bottomInset,
  topInset: sizeInfo.topInset,
  isSimulator: !Constants.isDevice,
  isFirebaseEnabled: !debug || false,
  isAutoStartEnabled: false, //! debug && true,
  isScreenshotEnabled: !debug || false,
  isMotionMenuEnabled: !debug || true,
  isComposerEnabled: false, //! debug || false,
  debug,
  ballDistance: 60,
  rotationSpeed: 4,
  epsilon: 15,
  angleRange: [25, 155],
  visibleTargets: 5,
  ignoredYellowBox: ['Module ABI', "Audio doesn't exist"],
  slug: debug ? 'crossy-road' : 'users',
  isEveryScoreBest: debug && false,
  isCacheProfileUpdateActive: !debug || false,
  shouldDelayFirebaseProfileSyncInMinutes: 60,

  canEditPhoto: false,
  leaderPageSize: 25,
};

export default Settings;
