import { connectActionSheet } from '../universal/ActionSheet';
import { dispatch } from '@rematch/core';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

import ProfileImage from '../components/ProfileImage';
import ProfileMetaDataView from '../components/ProfileMetaDataView';
import UpgradeAccountView from '../components/UpgradeAccountView';
import Fire from '../ExpoParty/Fire';

class App extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const uid = params.uid || Fire.shared.uid;

    let headerRight;
    if (uid !== Fire.shared.uid) {
      headerRight = (
        <Text
          onPress={() => {
            navigation.navigate('Report', navigation.state.params);
          }}
          style={styles.reportButton}
        >
          Report
        </Text>
      );
    }

    return {
      title: 'Player Profile',
      headerRight,
    };
  };

  constructor(props) {
    super(props);

    dispatch.players.getAsync({ uid: this.uid });
  }

  get uid() {
    const { params = {} } = this.props.navigation.state;
    const uid = params.uid || Fire.shared.uid;
    return uid;
  }

  get isUser() {
    return Fire.shared.uid === this.uid;
  }

  get image() {
    const { user = {} } = this.props;
    if (user.fbuid) {
      return `https://graph.facebook.com/${user.fbuid}/picture?type=large`;
    }
    return user.photoURL;
  }

  onLogout = () => {
    dispatch.user.logoutAsync();
  };

  render() {
    const { user = {} } = this.props;

    const isSignedInWithFB = !!user.fbuid;

    const canUpgrade = this.isUser && !isSignedInWithFB;
    const canLogout = isSignedInWithFB;
    const name = user.displayName || user.deviceName;
    const createdAt = user.createdAt || user.lastRewardTimestamp;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <ProfileImage isUser={this.isUser} name={name} image={this.image} />
          <ProfileMetaDataView name={name} createdAt={createdAt} />
        </View>

        {this.isUser && <UpgradeAccountView canLogout={canLogout} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  reportButton: {
    fontWeight: 'bold',
    marginRight: 12,
    color: 'white',
  },
});

const ASProfile = connectActionSheet(App);

export default connect(
  ({ players }) => ({ players }),
  {},
  ({ players = {}, ...stateProps }, dispatchProps, ownProps) => {
    const { params = {} } = ownProps.navigation.state;
    const uid = params.uid || Fire.shared.uid;
    const user = players[uid];

    return {
      ...ownProps,
      ...dispatchProps,
      ...stateProps,
      user,
    };
  },
)(ASProfile);
