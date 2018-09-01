import { dispatch } from '@rematch/core';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Facebook, Logout } from './Button';

export default class UpgradeAccountView extends React.Component {
  render() {
    const { canLogout } = this.props;

    return (
      <View style={styles.container}>
        {!canLogout && (
          <Text style={styles.text}>
            Link your account to access your score and achievements across games and devices.
          </Text>
        )}
        {canLogout && <Logout onPress={this._onLogout}>Log Out</Logout>}
        {!canLogout && <Facebook onPress={this._onPress}>Link with Facebook</Facebook>}
      </View>
    );
  }
  _onPress = () => {
    dispatch.facebook.upgradeAccount();
  };
  _onLogout = () => {
    dispatch.user.logoutAsync();
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'gray',
    paddingTop: 8,
    marginTop: 24,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
});
