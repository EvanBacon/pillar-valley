import { MaterialIcons } from '@expo/vector-icons';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Fire from '../ExpoParty/Fire';
import ReportList from '../components/ReportList';

const offenses = [
  'Cheating',
  'Naughty Photo',
  'Risqué Name',
  'Terrorist',
  'Annoying',
  'Something Else...',
].map(offense => ({ name: offense }));

export default class ReportScreen extends Component {
  static navigationOptions = {
    title: 'Report',
  };

  _onPressItem = ({ name }, index) => {
    Fire.shared.submitComplaint(uid, name);
    this.props.navigation.goBack();
    alert(
      `Congrats! ${
        this.props.navigation.state.params.name
      } will be investigated with surgical precision.`,
    );
  };

  render() {
    const { name, uid } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', margin: 24, marginLeft: 16 }}>
          <MaterialIcons size={36} color={'#34495e'} name="security" />

          <Text style={styles.header}>Report {name}</Text>
        </View>
        <ReportList
          data={offenses}
          onPress={this._onPressItem}
          title={`What did ${name} do to you?`}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  header: {
    marginLeft: 12,
    marginTop: 4,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
