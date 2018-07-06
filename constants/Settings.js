import { Constants } from 'expo';
import { Dimensions } from 'react-native';
import sizeInfo from '../utils/whatAmI';

export default {
  isRunningInExpo: sizeInfo.isRunningInExpo,
  isIPhone: sizeInfo.isIPhone,
  isIPad: sizeInfo.isIPad,
  isIPhoneX: sizeInfo.isIPhoneX,
  bottomInset: sizeInfo.bottomInset,
  topInset: sizeInfo.topInset,
  isSimulator: !Constants.isDevice,
  debug: __DEV__,
  ballDistance: 60,
  rotationSpeed: 4,
  epsilon: 15,
  angleRange: [25, 155],
  visibleTargets: 6,
  ignoredYellowBox: ['Module ABI', `Audio doesn't exist`],
};
