import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../Avatar';

export default class Item extends React.Component {
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };
  render() {
    const { index, onPress, style, ...props } = this.props;
    let item = this.props.item || {};

    const { name, score, rank, image } = item;

    return (
      <TouchableHighlight
        underlayColor={'#eeeeee'}
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.rank}>{rank || index + 1}</Text>
            <Avatar
              textStyle={{ fontWeight: 'bold' }}
              avatarStyle={{ marginRight: 16 }}
              name={name}
              image={image}
            />
            <View>
              <Text style={styles.text}>{name}</Text>
              <Text style={styles.subtitle}>{score} Points</Text>
            </View>
          </View>
          <Ionicons size={24} color={'#CCCCCC'} name="ios-arrow-forward" />
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
  },
  rank: {
    alignSelf: 'center',
    fontSize: 24,
    minWidth: 48,
    marginRight: 8,
  },
  text: { fontWeight: 'bold' },
  subtitle: {
    opacity: 0.7,
  },
});
