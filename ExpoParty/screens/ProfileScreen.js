import { connectActionSheet } from '@expo/react-native-action-sheet';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Constants, ImagePicker, Permissions } from 'expo';
import React, { Component } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Avatar from '../components/Avatar';
import Fire from '../Fire';

const FacebookButton = ({ onPress, children }) => (
  <FontAwesome.Button
    name="facebook"
    backgroundColor="#3b5998"
    onPress={onPress}
  >
    {children}
  </FontAwesome.Button>
);

const EditPhotoButton = ({ onPress, style }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 36 / 2,
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MaterialIcons
        style={{ backgroundColor: 'transparent' }}
        name={'add'}
        color={'white'}
        size={24}
      />
    </View>
  </TouchableOpacity>
);

class App extends Component {
  static navigationOptions = ({ navigation }) => {
    const { uid } = navigation.state.params;

    let headerRight;
    if (uid !== Fire.shared.uid) {
      headerRight = (
        <Text
          onPress={() => {
            navigation.navigate('LeaderboardReport', navigation.state.params);
          }}
          style={{
            fontWeight: 'bold',
            marginRight: 12,
            color: Constants.manifest.primaryColor,
          }}
        >
          Report
        </Text>
      );
    }

    return {
      title: 'Player Profile', //navigation.state.params.name,
      headerRight,
    };
  };

  get isUser() {
    const { uid } = this.props.navigation.state.params;

    return Fire.shared.uid === uid;
  }
  _onPressEditPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();
  };

  _getPermission = async permission => {
    let { status } = await Permissions.askAsync(permission);
    if (status !== 'granted') {
      Linking.openURL('app-settings:');
      return false;
    }
    return true;
  };

  _takePhoto = async () => {
    const permission = await this._getPermission(Permissions.CAMERA);
    if (!permission) {
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this._setNewPhoto(result.uri);
    }
  };

  _setNewPhoto = async uri => {
    alert('TODO: Evan: Add photo upload', uri);
  };

  _selectPhoto = async () => {
    const permission = await this._getPermission(Permissions.CAMERA_ROLL);
    if (!permission) {
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this._setNewPhoto(result.uri);
    }
  };

  _viewProfilePicture = () => {
    //TODO: Evan: Lightbox
  };

  _onPressPhoto = async () => {
    if (!this.isUser) {
      this._viewProfilePicture();
      return;
    }
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const sheetOptions = [
      {
        name: 'View Profile Picture',
        action: this._viewProfilePicture,
      },
      {
        name: 'Take New Photo',
        action: this._takePhoto,
      },
      {
        name: 'Select New Photo',
        action: this._selectPhoto,
      },
      { name: 'Cancel' },
    ];
    let destructiveButtonIndex = 0;
    let cancelButtonIndex = sheetOptions.length - 1;

    this.props.showActionSheetWithOptions(
      {
        options: sheetOptions.map(({ name }) => name),
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          const { action } = sheetOptions[buttonIndex];
          console.log(buttonIndex, sheetOptions[buttonIndex]);
          if (action) {
            action(buttonIndex);
          }
        }
        // Do something here depending on the button index selected
      },
    );
  };

  _upgradeAccount = () => {
    alert('TODO: Evan: Add account upgrade');
  };

  render() {
    const { name, image } = this.props.navigation.state.params;
    const avatarSize = 128;
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              marginRight: 16,
              height: avatarSize,
              minWidth: avatarSize,
            }}
          >
            <TouchableOpacity onPress={this._onPressPhoto}>
              <Avatar
                textStyle={{ fontWeight: 'bold', fontSize: 48 }}
                avatarStyle={{
                  width: '100%',
                  height: '100%',
                  borderRadius: avatarSize / 2,
                }}
                name={name}
                image={image}
              />
              {this.isUser && (
                <EditPhotoButton
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
                  onPress={this._onPressEditPhoto}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text style={styles.paragraph}>{name}</Text>
            <Text style={styles.subtitle}>
              Plays Nitro Roll, Sunset Cyberspace, and Pillar Valley
            </Text>
          </View>
        </View>
        {this.isUser && (
          <View
            style={{
              alignItems: 'flex-start',
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: 'gray',
              paddingTop: 8,
              marginTop: 24,
            }}
          >
            <Text style={styles.infoText}>
              Link your account to access your score and achievements across
              games and devices.
            </Text>
            <FacebookButton onPress={this._upgradeAccount}>
              Link with Facebook
            </FacebookButton>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 24,
    backgroundColor: '#ecf0f1',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    maxWidth: '80%',
  },
  paragraph: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
export default connectActionSheet(App);
