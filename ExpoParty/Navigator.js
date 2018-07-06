import { Constants } from 'expo';
import { createStackNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import { View } from 'react-native';
import tabBarIcon from './components/tabBarIcon';
import AchievementScreen from './screens/AchievementScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';

const LeaderboardNavigator = createStackNavigator({
  LeaderboardMain: {
    screen: LeaderboardScreen,
  },
  LeaderboardProfile: {
    screen: ProfileScreen,
  },
  LeaderboardReport: {
    screen: ReportScreen,
  },
});

const AchievementNavigator = createStackNavigator({
  AchievementMain: {
    screen: AchievementScreen,
  },
  AchievementInfo: {
    screen: ProfileScreen,
  },
});

const PartyTabNavigator = createMaterialBottomTabNavigator(
  {
    Achievement: {
      screen: AchievementNavigator,
      navigationOptions: () => ({
        tabBarColor: '#9013FE',
        tabBarIcon: tabBarIcon('star'),
      }),
    },
    Leaderboard: {
      screen: LeaderboardNavigator,
      navigationOptions: () => ({
        tabBarColor: '#2962ff',
        tabBarIcon: tabBarIcon('show-chart'),
      }),
    },
  },
  {
    shifting: true,

    initialRouteName: 'Leaderboard',
    activeTintColor: '#f0edf6',
    inactiveTintColor: '#3e2465',
    barStyle: { backgroundColor: '#694fad' },

    mode: 'modal',
    title: Constants.manifest.name,
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

export default PartyTabNavigator;
