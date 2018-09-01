import { Constants } from './universal/Expo';
import { createStackNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import Licenses from './components/Licenses';
import tabBarIcon from './components/tabBarIcon';
import GameScreen from './screens/GameScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';

const themedHeaderProps = {
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: Constants.manifest.primaryColor,
  },
  headerTitleStyle: { color: 'white' },
};

// const PartyTabNavigator = LeaderboardScreen;
const PartyTabNavigator = createMaterialBottomTabNavigator(
  {
    Leaderboard: {
      screen: LeaderboardScreen,
      navigationOptions: () => ({
        tabBarColor: '#2962ff',
        tabBarIcon: tabBarIcon('podium'), // 'show-chart'),
      }),
    },
    // Achievement: {
    //   screen: AchievementScreen,
    //   navigationOptions: () => ({
    //     tabBarColor: '#9013FE',
    //     tabBarIcon: tabBarIcon('star'),
    //   }),
    // },
    ProfileScreen: {
      screen: ProfileScreen,
      navigationOptions: () => ({
        title: 'Profile',
        tabBarColor: '#40D8FF',
        tabBarIcon: tabBarIcon('person'),
      }),
    },
  },
  {
    shifting: true,

    initialRouteName: 'Leaderboard',
    activeTintColor: '#f0edf6',
    inactiveTintColor: '#3e2465',
    barStyle: {
      backgroundColor: '#694fad',
      alignItems: 'stretch',
    },
    mode: 'modal',
    title: Constants.manifest.name,
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

const ModalStack = createStackNavigator(
  {
    Game: GameScreen,
    Leaderboard: {
      screen: PartyTabNavigator,
      navigationOptions: {
        title: `Expo ${Constants.manifest.name}`,
      },
    },
    Licenses,
    Report: ReportScreen,
    Profile: ProfileScreen,
  },
  {
    navigationOptions: {
      ...themedHeaderProps,
    },
    initialRouteName: 'Game',
    // initialRouteName: 'Leaderboard',
    // mode: 'modal',
    // headerMode: 'none',
    cardStyle: {
      backgroundColor: 'white',
    },
  },
);

export default ModalStack;
