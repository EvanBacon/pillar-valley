import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { connect } from 'react-redux';
import Settings from '../constants/Settings';
import { FontAwesome } from '@expo/vector-icons';

class ScoreMeta extends React.Component {
 
  render() {
    const { current, best, currency } = this.props;
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.text, styles.highScore]}>{best}</Text>
          <Text style={[styles.text, styles.score]}>{current}</Text>
        </View>
        {!currency && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.text, styles.currency]}>{currency}</Text>
            <FontAwesome
              name="diamond"
              size={20}
              color="lime"
              style={{ marginHorizontal: 6, userSelect: 'none' }}
            />
          </View>
        )}
      </View>
    );
  }
}

export default connect(
  ({ score: { current, best }, currency: { current: currency } }) => ({
    current,
    best,
    currency,
  }),
)(ScoreMeta);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Settings.topInset,
    left: 0,
    right: 0,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'GothamNarrow-Book',
    opacity: 0.8,
    fontSize: 48,
    backgroundColor: 'transparent',
    userSelect: 'none',
  },
  score: {
    color: 'white',
  },
  highScore: {
    color: 'yellow',
    textAlign: 'right',
    fontSize: 24,
    marginRight: 6,
  },
  currency: {
    fontSize: 24,
    color: 'white',
  },
});
