import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';

export default class Footer extends React.Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
  };

  onPress = () => {
    console.log('press footer', this.props.onPress);
    this.props.onPress();
  };
  render() {
    const { style, ...props } = this.props;
    return (
      <TouchableHighlight underlayColor="#eeeeee" {...props} onPress={this.onPress} style={[styles.touchable, style]}>
        <Text style={styles.text}>Load More...</Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.3)',
  },
  text: { fontWeight: 'bold', fontSize: 16 },
});
