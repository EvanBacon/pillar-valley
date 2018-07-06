import { View as GraphicsView } from 'expo-graphics';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import GameState from '../Game';
import Footer from './Footer';
import ScoreMeta from './ScoreMeta';
import TouchableView from './TouchableView';
import Settings from '../constants/Settings';

class Game extends React.Component {
  componentWillMount() {
    if (!Settings.isSimulator) {
      this.machine = new GameState();
    }
  }
  componentWillUnmount() {
    this.machine = null;
  }

  onContextCreate = async props => {
    await this.machine.onContextCreateAsync(props);

    this.props.onLoad();
  };

  onLeaderboardPress = () => {
    if (Settings.isFirebaseEnabled) {
      this.props.navigation.navigate('Leaderboard');
    } else {
      alert('Expo Online is disabled');
    }
  };

  get gameScreen() {
    if (Settings.isSimulator) {
      return <View style={{ flex: 1, backgroundColor: 'red' }} />;
    } else {
      return (
        <TouchableView
          style={styles.touchable}
          onTouchesBegan={this.machine.onTouchesBegan}
        >
          <GraphicsView
            ref={ref => (global.gameRef = this.ref = ref)}
            key="game"
            onContextCreate={this.onContextCreate}
            onRender={this.machine.onRender}
            onResize={this.machine.onResize}
          />
        </TouchableView>
      );
    }
  }

  render() {
    return (
      <View style={styles.container} pointerEvents="box-none">
        {this.gameScreen}
        <ScoreMeta />
        <Footer onLeaderboardPress={this.onLeaderboardPress} />
      </View>
    );
  }
}

export default Game;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchable: {
    flex: 1,
  },
});
