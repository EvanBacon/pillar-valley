import ExpoGraphics from 'expo-graphics';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Machine from '../Game';
import Footer from './Footer';
import ScoreMeta from './ScoreMeta';
import TouchableView from './TouchableView';

class Game extends React.Component {
  componentWillMount() {
    this.machine = new Machine();
  }
  componentWillUnmount() {
    this.machine = null;
  }

  onContextCreate = async context => {
    await this.machine.onContextCreateAsync(context);

    this.props.onLoad();
  };

  onLeaderboardPress = () => {
    this.props.navigation.navigate('Leaderboard');
  };
  render() {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <TouchableView
          style={styles.touchable}
          onTouchesBegan={this.machine.onTouchesBegan}
        >
          <ExpoGraphics.View
            ref={ref => (global.gameRef = this.ref = ref)}
            key="game"
            onContextCreate={this.onContextCreate}
            onRender={this.machine.onRender}
            onResize={this.machine.onResize}
          />
        </TouchableView>
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
