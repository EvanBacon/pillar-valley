import { Constants } from 'expo';

export default {
  isSimulator: !Constants.isDevice,
  debug: __DEV__,
  ballDistance: 60,
  rotationSpeed: 4,
  epsilon: 15,
  angleRange: [25, 155],
  visibleTargets: 6,
};
