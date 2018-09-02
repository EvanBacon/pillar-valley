import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

export default class Separator extends PureComponent {
  render() {
    return <View {...this.props} style={StyleSheet.flatten([styles.container, this.props.style])} />;
  }
}

const styles = StyleSheet.create({
  container: {
    height: StyleSheet.hairlineWidth,
    width: 'auto',
    marginLeft: 16,
    backgroundColor: '#CED0CE',
  },
});
