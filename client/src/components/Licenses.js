// @flow
import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import Settings from '../constants/Settings';
import Data from '../licenses';
import LicensesListItem from './LicensesListItem';

function extractNameFromGithubUrl(url) {
  if (!url) {
    return null;
  }

  const reg = /((https?:\/\/)?(www\.)?github\.com\/)?(@|#!\/)?([A-Za-z0-9_]{1,15})(\/([-a-z]{1,20}))?/i;
  const components = reg.exec(url);

  if (components && components.length > 5) {
    return components[5];
  }
  return null;
}

function sortDataByKey(data, key) {
  data.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
  return data;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const licenses = Object.keys(Data).map((key) => {
  const { licenses, ...license } = Data[key];
  const [name, version] = key.split('@');

  const reg = /((https?:\/\/)?(www\.)?github\.com\/)?(@|#!\/)?([A-Za-z0-9_]{1,15})(\/([-a-z]{1,20}))?/i;
  let username = extractNameFromGithubUrl(license.repository) || extractNameFromGithubUrl(license.licenseUrl);

  let userUrl;
  let image;
  if (username) {
    username = capitalizeFirstLetter(username);
    image = `http://github.com/${username}.png`;
    userUrl = `http://github.com/${username}`;
  }

  return {
    key,
    name,
    image,
    userUrl,
    username,
    licenses: licenses.slice(0, 405),
    version,
    ...license,
  };
});

sortDataByKey(licenses, 'username');

export default class Licenses extends Component {
  static navigationOptions = {
    title: 'Libraries',
  };
  renderItem = ({ item }) => <LicensesListItem {...item} />;
  render() {
    // const { licenses } = this.props;

    return (
      <FlatList
        style={styles.list}
        keyExtractor={({ key }) => key}
        data={licenses}
        contentContainerStyle={{ paddingBottom: Settings.bottomInset }}
        renderItem={this.renderItem}
      />
    );
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
