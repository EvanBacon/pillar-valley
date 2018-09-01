// @flow
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import Settings from '../../constants/Settings';
import Header from './Header';
import Item from './Item';
import Separator from './Separator';

class List extends React.Component {
  renderItem = props => <Item {...props} onPress={this.props.onPress} />;

  keyExtractor = (item, index) => `item-${index}`;
  render() {
    const {
      style, title, onPressHeader, headerButtonTitle, ...props
    } = this.props;
    return (
      <FlatList
        style={[style, styles.container]}
        keyExtractor={this.keyExtractor}
        ListHeaderComponent={headerProps => (
          <Header {...headerProps} buttonTitle={headerButtonTitle} onPress={onPressHeader} title={title} />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: Settings.isIPhoneX ? 64 : 0 }}
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
