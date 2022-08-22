import { isDevice } from "expo-device";

const debug = __DEV__;
const Settings = {
  facebookLoginProps: {
    permissions: [
      "public_profile",
      "email",
      // 'user_friends'
    ],
  },
  isPromo: false,
  circleEnabled: true,
  isSimulator: !isDevice,
  isFirebaseEnabled: false, // !debug || false,
  isAutoStartEnabled: false, //! debug && true,
  isScreenshotEnabled: false, //!debug || false,
  isMotionMenuEnabled: !debug || true,
  debug,
  ballDistance: 60,
  rotationSpeed: 4,
  angleRange: [25, 155],
  visiblePillars: 5,
  slug: debug ? "crossy-road" : "users",
  isEveryScoreBest: debug && false,
  isCacheProfileUpdateActive: true, //!debug || false,
  shouldDelayFirebaseProfileSyncInMinutes: 60,
  gemsEnabled: false,
  maxRotationSpeed: 6,
  minBallScale: 0.01,
  canEditPhoto: false,
  leaderPageSize: 25,
};

export default Settings;
