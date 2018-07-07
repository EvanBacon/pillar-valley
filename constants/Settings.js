import { Constants } from 'expo';
import { Dimensions } from 'react-native';
import sizeInfo from '../utils/whatAmI';

const Settings = {
  isRunningInExpo: sizeInfo.isRunningInExpo,
  isIPhone: sizeInfo.isIPhone,
  isIPad: sizeInfo.isIPad,
  isIPhoneX: sizeInfo.isIPhoneX,
  bottomInset: sizeInfo.bottomInset,
  topInset: sizeInfo.topInset,
  isSimulator: !Constants.isDevice,
  isFirebaseEnabled: !__DEV__ || false,
  isAutoStartEnabled: !__DEV__ || true,
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
};

export default Settings;
