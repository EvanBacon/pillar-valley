// @flow
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

import Assets from '../Assets';

const { width, height } = Dimensions.get('window');

export default class Loading extends React.Component {
  static defaultProps = {
    text: 'Loading...',
  };
  render() {
    const { text, loading, children } = this.props;
    return (
      <View
        style={{
          // minWidth: width,
          // maxWidth: width,
          // minHeight: height,
          // maxHeight: height,
          width: '100%',
          height: '100%',
          flex: 1,
        }}
      >
        {children}
        {loading && <Image style={styles.container} source={Assets.icons['splash.png']} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC266',
  },
  text: {
    textAlign: 'center',
  },
});
