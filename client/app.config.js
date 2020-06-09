export default {
  name: "Pillar Valley",
  description: "Immerse yourself in a suave world of zen",
  slug: "pillar-valley",
  privacy: "public",
  version: "4.0.0",
  orientation: "portrait",
  primaryColor: "#E07C4C",
  icon: "./src/assets/icons/expo.png",
  facebookScheme: "fb270942376819196",
  facebookAppId: "270942376819196",
  facebookDisplayName: "Bacon Box",
  githubUrl: "https://github.com/evanbacon/expo-pillar-valley",
  splash: {
    image: "./src/assets/icons/splash.png",
    backgroundColor: "#E07C4C",
    resizeMode: "cover",
  },
  assetBundlePatterns: ["src/assets/**/*"],
  ios: {
    appStoreUrl:
      "https://itunes.apple.com/us/app/pillar-valley/id1336398804?ls=1&mt=8",
    icon: "./src/assets/icons/ios.png",
    supportsTablet: true,
    bundleIdentifier: "com.evanbacon.pillarvalley",
    buildNumber: "3",
  },
  android: {
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.evanbacon.pillarvalley",
    icon: "./src/assets/icons/expo.png",
    package: "com.evanbacon.pillarvalley",
    versionCode: 2,
  },
  web: {
    favicon: "./src/assets/icons/expo.png",
  },
};
