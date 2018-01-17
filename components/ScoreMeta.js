import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

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
    top: 28,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'GothamNarrow-Book',
    opacity: 0.8,
    backgroundColor: 'transparent',
  },
  score: {
    color: 'white',
    fontSize: 48,
  },
  highScore: {
    color: 'yellow',
    fontSize: 36,
    textAlign: 'right',
  },
});
