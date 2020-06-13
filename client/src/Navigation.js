// import Ionicons from "@expo/vector-icons/Ionicons";
// import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as React from "react";
// import { Platform } from "react-native";
import Licenses from "./components/Licenses";
// import Fire from "./ExpoParty/Fire";
import GameScreen from "./screens/GameScreen";
import ChallengesScreen from "./screens/AchievementScreen";
// import LeaderboardScreen from "./screens/LeaderboardScreen";
// import ProfileScreen from "./screens/ProfileScreen";
// import ReportScreen from "./screens/ReportScreen";
import * as Analytics from "expo-firebase-analytics";

// const AppTab = createMaterialTopTabNavigator();

// const tabBarIcon = (name) => ({ tintColor }) => (
//   <Ionicons
//     style={{ backgroundColor: "transparent" }}
//     name={`md-${name}`}
//     color={tintColor}
//     size={24}
//   />
// );

const AppStack = createStackNavigator();

const linking = {
  prefixes: [Linking.makeUrl()],
  config: {
    Game: "/",
    Licenses: "/credit",
    Report: "/report",
    Challenges: "/challenges",
    Social: {
      screens: {
        Leaderboard: "/rank",
        Profile: "/u",
      },
    },
  },
};

// Gets the current screen from navigation state
const getActiveRouteName = (state) => {
  const route = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

export default () => {
  const routeNameRef = React.useRef(null);
  const navigationRef = React.useRef(null);

  React.useEffect(() => {
    if (!navigationRef.current) return;
    const state = navigationRef.current.getRootState();

    // Save the initial route name
    routeNameRef.current = getActiveRouteName(state);
  }, [navigationRef]);

  React.useEffect(() => {
    Analytics.setCurrentScreen("Game");
  }, []);
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = getActiveRouteName(state);

        if (previousRouteName !== currentRouteName) {
          // The line below uses the expo-firebase-analytics tracker
          // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
          // Change this line to use another Mobile analytics SDK
          Analytics.setCurrentScreen(currentRouteName);
        }

        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
      }}
      linking={linking}
    >
      <AppStack.Navigator
        headerMode="screen"
        screenOptions={{
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Constants.manifest.primaryColor,
          },
          headerTitleStyle: { color: "white" },

          headerTintColor: "#fff",
          cardStyle: {
            backgroundColor: "white",
          },
        }}
        initialRouteName="Game"
      >
        <AppStack.Screen
          name="Game"
          component={GameScreen}
          options={{ header: () => null }}
        />
        <AppStack.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{ stackPresentation: "modal" }}
        />
        <AppStack.Screen
          name="Licenses"
          component={Licenses}
          options={{ stackPresentation: "modal" }}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
  // <AppStack.Screen
  //   name="Social"
  //   component={TabNavigation}
  //   options={{ stackPresentation: "modal" }}
  //   options={{
  //     title: `Expo ${Constants.manifest.name}`,
  //   }}
  // />
  // <AppStack.Screen
  //   name="Report"
  //   component={ReportScreen}
  //   options={{ title: "Report" }}
  // />
  // <AppStack.Screen
  //   name="Profile"
  //   component={ProfileScreen}
  //   options={({ navigation, route }) => {
  //     const uid = route.uid || Fire.shared.uid;

  //     let headerRight;
  //     if (uid !== Fire.shared.uid) {
  //       headerRight = (
  //         <Text
  //           onPress={() => {
  //             navigation.navigate("Report", route);
  //           }}
  //           style={styles.reportButton}
  //         >
  //           Report
  //         </Text>
  //       );
  //     }

  //     return {
  //       title: "Player Profile",
  //       headerRight,
  //     };
  //   }}
  // />
};

// const TabNavigation = () => {
//   return (
//     <AppTab.Navigator
//       initialRouteName="Leaderboard"
//       tabBarOptions={{
//         shifting: true,
//         activeTintColor: "#f0edf6",
//         inactiveTintColor: "#3e2465",
//         barStyle: {
//           backgroundColor: "#694fad",
//           alignItems: "stretch",
//         },
//         mode: "modal",
//         title: Constants.manifest.name,
//         cardStyle: {
//           backgroundColor: "transparent",
//         },
//       }}
//     >
//       <AppTab.Screen
//         name="Leaderboard"
//         component={LeaderboardScreen}
//         options={{
//           tabBarColor: "#2962ff",
//           title: tabBarIcon("podium"), // 'show-chart'),
//         }}
//       />
//       <AppTab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           title: "Profile",
//           tabBarColor: "#40D8FF",
//           tabBarIcon: tabBarIcon("person"),
//         }}
//       />
//     </AppTab.Navigator>
//   );
// };
