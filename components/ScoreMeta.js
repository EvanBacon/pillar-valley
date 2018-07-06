import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Settings from '../constants/Settings';

class ScoreMeta extends React.Component {
  render() {
    const { current, best } = this.props;
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.score]}>{current}</Text>
        <Text style={[styles.text, styles.highScore]}>{best}</Text>
      </View>
    );
  }
}

export default connect(({ score: { current, best } }) => ({
  current,
  best,
}))(ScoreMeta);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Settings.topInset,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'GothamNarrow-Book',
    opacity: 0.8,
    fontSize: 48,
    backgroundColor: 'transparent',
  },
  score: {
    color: 'white',
  },
  highScore: {
    color: 'yellow',
    textAlign: 'right',
  },
});
