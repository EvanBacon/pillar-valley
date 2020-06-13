export default {
  name: "Pillar Valley",
  description: "Immerse yourself in a suave world of zen",
  slug: "pillar-valley",
  privacy: "public",
  version: "4.0.0",
  orientation: "portrait",
  primaryColor: "#E07C4C",
  scheme: "plrvly",
  icon: "./src/assets/icons/expo.png",
  facebookScheme: "fb270942376819196",
  facebookAppId: "270942376819196",
  facebookDisplayName: "Bacon Box",
  githubUrl: "https://github.com/evanbacon/expo-pillar-valley",
  splash: {
    image: "./src/assets/icons/splash.png",
    backgroundColor: "#F09458",
    resizeMode: "cover",
  },
  assetBundlePatterns: ["src/assets/**/*"],
  ios: {
    appStoreUrl:
      "https://itunes.apple.com/us/app/pillar-valley/id1336398804?ls=1&mt=8",
    icon: "./src/assets/icons/ios.png",
    supportsTablet: true,
    bundleIdentifier: "com.evanbacon.pillarvalley",
    buildNumber: "5",
    googleServicesFile: "./GoogleService-Info.plist",
    config: {
      googleMobileAdsAppId: "ca-app-pub-2312569320461549~5287895909",
      googleMobileAdsAutoInit: true,
    },
    associatedDomains: ["applinks:https://pillarvalley.netlify.app"],
  },
  android: {
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.evanbacon.pillarvalley",
    icon: "./src/assets/icons/expo.png",
    package: "com.evanbacon.pillarvalley",
    googleServicesFile: "./google-services.json",
    versionCode: 3,
    config: {
      googleMobileAdsAppId: "ca-app-pub-2312569320461549~8488774315",
      googleMobileAdsAutoInit: true,
    },
  },
  web: {
    favicon: "./src/assets/icons/expo.png",
    config: {
      firebase: {
        apiKey: "AIzaSyAkOa9Hyx6aKaSItFWBbrw_zou6RlQYdck",
        authDomain: "game-f26ee.firebaseapp.com",
        databaseURL: "https://game-f26ee.firebaseio.com",
        projectId: "game-f26ee",
        storageBucket: "game-f26ee.appspot.com",
        messagingSenderId: "997358977148",
        appId: "1:997358977148:web:a3a494984ed9dd976909f9",
        measurementId: "G-3PJBNEEFP4",
      },
    },
  },
};
