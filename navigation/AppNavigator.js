import GameScreen from '../screens/GameScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { StackNavigator } from 'react-navigation';

const ModalStack = StackNavigator(
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
