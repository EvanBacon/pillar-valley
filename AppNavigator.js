import GameScreen from './screens/GameScreen';
import { createStackNavigator } from 'react-navigation';
import PartyTabNavigator from './ExpoParty/Navigator';

const ModalStack = createStackNavigator(
  {
    Game: {
      screen: GameScreen,
    },
    Leaderboard: {
      screen: PartyTabNavigator,
    },
  },
  {
    initialRouteName: 'Leaderboard',
    mode: 'modal',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

export default ModalStack;
