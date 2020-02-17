// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';

import Settings from '../constants/Settings';
import GameStates from '../Game/GameStates';
import * as Button from './Button';

import * as StoreReview from 'expo-store-review';

function Footer({
  style,
  game,
  screenshot,
  onLeaderboardPress,
  onLicensesPress,
  ...props
}) {
  
  const [supportsStoreReview, setStoreReview] = React.useState(false);
  React.useEffect(() => {
    StoreReview.isAvailableAsync().then(isAvailable => {
      setStoreReview(isAvailable)
    });
  }, []);
    const animation = game === GameStates.Menu ? 'zoomIn' : 'zoomOut';
    const delay = 100;
    const initialDelay = 100;
    const duration = 500;
    const easing = 'ease-out';

   

    const views = [
      <Button.Sound />,
      <Button.Licenses onPress={onLicensesPress} />,
    ];

    if (Settings.isFirebaseEnabled) {
      views.unshift(<Button.Leaderboard onPress={onLeaderboardPress} />);
    }
    if (screenshot) {
      views.push(<Button.Share />);
    }

    if (supportsStoreReview) {
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

export default connect(({ game, screenshot }) => ({ game, screenshot }))(
  Footer,
);
