// @flow
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';

export default class Item extends React.Component {
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };
  render() {
    const {
      item: { name },
      index,
      onPress,
      style,
      ...props
    } = this.props;
    return (
      <TouchableHighlight underlayColor="#eeeeee" {...props} onPress={this.onPress} style={[styles.touchable, style]}>
        <View style={styles.container}>
          <Text style={styles.text}>{name}</Text>
          <Ionicons size={24} color="#CCCCCC" name="ios-arrow-forward" />
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
  text: { fontWeight: 'bold' },
});
