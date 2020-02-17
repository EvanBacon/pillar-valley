import React from 'react';
import { Alert, Linking } from 'react-native';

import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants'; 
import Icon from './Icon';

class Rate extends React.Component {
  static defaultProps = {
    onPress: () => {},
  };
  onPress = () => {
    if (StoreReview.isSupported()) {
      StoreReview.requestReview();
    } else {
      const { name } = Constants.manifest;
      Alert.alert(
        `Do you like ${name}?`,
        `Would you like to rate this app in the app store? It help's others discover ${name} too!`,
        [
          {
            text: 'OK',
            onPress: () => Linking.openURL(StoreReview.storeUrl()),
          },
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
    this.props.onPress();
  };
  render() {
    const { onPress, name, ...props } = this.props;

    if (!StoreReview.isSupported()) {
      return null;
    }
    return <Icon onPress={this.onPress} name="star" {...props} />;
  }
}

export default Rate;
