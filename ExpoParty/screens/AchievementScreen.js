import { connectActionSheet } from '@expo/react-native-action-sheet';
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import AchievementsItem from '../components/AchievementsItem';
import List from '../components/List';
import UserAchievementsItem from '../components/UserAchievementsItem';
import connectAchievementToast from '../connectAchievementToast';

const data = [
  {
    name: '1st Gold',
    subtitle: 'Finish a level with a gold record.',
    points: 50,
    image: null,
    complete: true,
  },
  {
    name: '1st Silver',
    subtitle: 'Finish a level with a silver record.',
    points: 25,
    image: null,
    complete: false,
  },
  {
    name: '1st Bronze',
    subtitle: 'Finish a level with a bronze record.',
    points: 10,
    image: null,
  },
  {
    name: 'get your s-w-a-g-agger up',
    subtitle: 'Finish a level with all the apples.',
    points: 100,
    image: null,
    complete: true,
  },
  {
    name: 'just like a fender bender',
    subtitle: 'Finish a level with all the apples.',
    points: 10,
    image: null,
  },
  {
    name: 'red like dodgeball',
    subtitle: 'Finish a level with all the apples.',
    points: 50,
    image: null,
  },
].map((user, index) => {
  return {
    ...user,
  };
});

class App extends Component {
  static navigationOptions = {};

  state = {
    filter: 'All',
  };

  _onOpenActionSheet = () => {
    let options = ['All', 'Completed', 'Cancel'];
    let destructiveButtonIndex = 0;
    let cancelButtonIndex = options.length - 1;

    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          this.setState({ filter: options[buttonIndex] });
        }
      },
    );
  };

  componentDidMount() {
    // this._onPressItem(data[0]);
  }

  _onPressItem = item => {
    console.log(item);
    // this.props.navigation.navigate('LeaderboardReport', {
    //   title: item.name,
    //   ...item,
    // });
    // this.props.navigation.navigate('AchievementInfo', {
    //   title: item.name,
    //   ...item,
    // });

    this.props.showAchievementToastWithOptions(
      { title: item.name, ...item },
      buttonIndex => {},
    );
  };

  _loadMore = () => {};

  render() {
    return (
      <View style={styles.container}>
        <List
          renderItem={props => (
            <AchievementsItem
              onPress={this._onPressItem}
              {...props}
              data={data}
            />
          )}
          title={`${data.length} Achievements`}
          headerButtonTitle={this.state.filter}
          data={data}
          renderUserItem={props => <UserAchievementsItem data={data} />}
          onPress={this._onPressItem}
          onPressHeader={this._onOpenActionSheet}
          onPressFooter={this._loadMore}
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
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});

export default connectActionSheet(connectAchievementToast(App));
