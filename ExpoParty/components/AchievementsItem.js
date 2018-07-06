import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  TouchableHighlight,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import ScoreBadge from './ScoreBadge';

export default class Item extends React.Component {
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };

  get icon() {
    const { complete } = this.props.item;
    const style = { marginLeft: 12 };
    if (complete) {
      return (
        <MaterialIcons style={style} size={24} color={'green'} name="check" />
      );
    }
    return (
      <MaterialIcons
        style={style}
        size={24}
        color={'orange'}
        name="hourglass-empty"
      />
    );
  }
  render() {
    const {
      item: { name, subtitle, points, image },
      index,
      onPress,
      style,
      ...props
    } = this.props;
    return (
      <TouchableHighlight
        underlayColor={'#eeeeee'}
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}>
        <View style={styles.container}>
          <View style={{ flexDirection: 'row', maxWidth: '50%' }}>
            <Avatar
              textStyle={{ fontWeight: 'bold' }}
              avatarStyle={{ marginRight: 16 }}
              name={name}
            />
            <View>
              <Text style={styles.text}>{name}</Text>
              <Text style={styles.subtitle}>{subtitle} Points</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ScoreBadge style={{}} color={'white'}>
              {points}
            </ScoreBadge>

            {this.icon}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {},
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rank: {
    alignSelf: 'center',
    fontSize: 24,
    minWidth: 36,
    marginRight: 8,
  },
  text: { fontWeight: 'bold' },
  subtitle: {
    opacity: 0.7,
  },
});
