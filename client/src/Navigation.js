import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Constants from "expo-constants";
import * as React from "react";

import Licenses from "./components/Licenses";
import tabBarIcon from "./components/tabBarIcon";
import GameScreen from "./screens/GameScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ReportScreen from "./screens/ReportScreen";

const AppTab = createMaterialTopTabNavigator();

const TabNavigation = () => {
  return (
    <AppTab.Navigator
      initialRouteName="Leaderboard"
      tabBarOptions={{
        shifting: true,
        activeTintColor: "#f0edf6",
        inactiveTintColor: "#3e2465",
        barStyle: {
          backgroundColor: "#694fad",
          alignItems: "stretch",
        },
        mode: "modal",
        title: Constants.manifest.name,
        cardStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <AppTab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarColor: "#2962ff",
          title: tabBarIcon("podium"), // 'show-chart'),
        }}
      />
      <AppTab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarColor: "#40D8FF",
          tabBarIcon: tabBarIcon("person"),
        }}
      />
    </AppTab.Navigator>
  );
};

const AppStack = createStackNavigator();

export default () => (
  <NavigationContainer>
    <AppStack.Navigator
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
        name="Leaderboard"
        component={TabNavigation}
        options={{
          title: `Expo ${Constants.manifest.name}`,
        }}
      />
      <AppStack.Screen name="Licenses" component={Licenses} />
      <AppStack.Screen name="Report" component={ReportScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
    </AppStack.Navigator>
  </NavigationContainer>
);
