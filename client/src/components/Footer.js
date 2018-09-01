// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';

import Settings from '../constants/Settings';
import GameStates from '../Game/GameStates';
import * as Button from './Button';

import { StoreReview } from '../universal/Expo';

class Footer extends React.Component {
  render() {
    const {
      style, game, screenshot, onLeaderboardPress, onLicensesPress, ...props
    } = this.props;
    const animation = game === GameStates.Menu ? 'zoomIn' : 'zoomOut';
    const delay = 100;
    const initialDelay = 100;
    const duration = 500;
    const easing = 'ease-out';

    const views = [<Button.Sound />, <Button.Licenses onPress={onLicensesPress} />];

    if (Settings.isFirebaseEnabled) {
      views.unshift(<Button.Leaderboard onPress={onLeaderboardPress} />);
    }
    if (screenshot) {
      views.push(<Button.Share />);
    }

    if (StoreReview.hasAction()) {
      views.push(<Button.Rate />);
    }
    return (
      <View style={[styles.container, style]}>
        {views.map((view, index) => {
          const _delay = index * delay;
          return (
            <Animatable.View
              useNativeDriver
              key={index}
              duration={duration + _delay}
              delay={initialDelay + _delay}
              animation={animation}
              easing={easing}
              style={styles.button}
            >
              {view}
            </Animatable.View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Settings.bottomInset,
  },
  button: {
    height: 64,
  },
});

export default connect(({ game, screenshot }) => ({ game, screenshot }))(Footer);
