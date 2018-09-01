import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import ScoreBadge from './ScoreBadge';

export default class UserAchievementsItem extends React.Component {
  state = { completed: [], score: 0 };

  constructor(props) {
    super(props);

    if (props.data) {
      const completed = props.data.filter(item => item.complete);
      console.log(completed);
      this.state = {
        completed,
        score: completed.reduce((total, item) => total + item.points, 0),
      };
    }
  }

  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };

  render() {
    const {
      data, index, onPress, style, ...props
    } = this.props;
    const { completed, score } = this.state;

    return (
      <TouchableHighlight underlayColor="#eeeeee" {...props} onPress={this.onPress} style={[styles.touchable, style]}>
        <View style={styles.container}>
          <Text style={styles.rank}>
            Completed {completed.length}/{data.length}
          </Text>
          <ScoreBadge color="white">{score}</ScoreBadge>

          {onPress && <Ionicons size={24} color="#CCCCCC" name="ios-arrow-forward" />}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {},
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.3)',
  },
  rank: {
    fontSize: 18,
    marginRight: 8,
  },
  text: { fontWeight: 'bold', fontSize: 16 },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});
