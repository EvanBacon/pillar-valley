import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Platform, Dimensions } from 'react-native';
import { Constants } from 'expo';

const isRunningInExpo = Constants.appOwnership === 'expo';

const isIphone = Platform.OS === 'ios';
//https://github.com/ptelad/react-native-iphone-x-helper/blob/3c919346769e3cb9315a5254d43fcad1aadee777/index.js#L1-L11
function isIphoneX() {
  const dimen = Dimensions.get('window');
  return (
    isIphone &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 || dimen.width === 812)
  );
}

import Item from './Item';
import Separator from './Separator';
import Header from './Header';
class List extends React.Component {
  renderItem = props => <Item {...props} onPress={this.props.onPress} />;
  
  keyExtractor = (item, index) => `item-${index}`;
  render() {
    const { style,title, onPressHeader, headerButtonTitle, ...props } = this.props;
    return (
      <FlatList
        style={[style, styles.container]}
        keyExtractor={this.keyExtractor}
        ListHeaderComponent={(headerProps) => <Header {...headerProps} buttonTitle={headerButtonTitle} onPress={onPressHeader} title={title}/>}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: isIphoneX() ? 64 : 0 }}
        renderItem={this.renderItem}
        {...props}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});

export default List;
