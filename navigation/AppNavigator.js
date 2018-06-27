import GameScreen from '../screens/GameScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { createStackNavigator } from 'react-navigation';

const ModalStack = createStackNavigator(
  {
    Game: {
      screen: GameScreen,
    },
    Leaderboard: {
      screen: LeaderboardScreen,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

export default ModalStack;
