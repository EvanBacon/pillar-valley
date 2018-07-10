import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Version can be specified in package.json

export default class LicensesListItem extends Component {
  render() {
    const {
      image,
      userUrl,
      username,
      name,
      version,
      licenses,
      repository,
      licenseUrl,
      parents,
    } = this.props;

    let title = name;
    if (username) {
      if (title.toLowerCase() != username.toLowerCase()) {
        title += ` by ${username}`;
      }
    }

    return (
      <View>
        <View style={styles.cardShadow}>
          <View style={styles.card}>
            {image && (
              <TouchableOpacity onPress={() => Linking.openURL(userUrl)}>
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              underlayColor={'#eeeeee'}
              onPress={() => Linking.openURL(repository)}
              style={styles.item}
            >
              <View style={{ maxWidth: '90%' }}>
                <Text style={styles.name}>{title}</Text>
                <Link style={styles.text} url={licenseUrl}>
                  {licenses}
                </Link>
                <Link style={styles.text}>{version}</Link>
              </View>
              <FontAwesome
                style={{ alignSelf: 'center' }}
                color={'#34495e'}
                size={16}
                name={'chevron-right'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const Link = ({ url, style, children }) => (
  <Text
    style={style}
    numberOfLines={1}
    onPress={() => url && Linking.openURL(url)}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cardShadow: {
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    aspectRatio: 1,
    width: 96,
    borderRadius: 0,
  },

  text: {
    color: '#34495e',
    marginTop: 3,
  },
});
