import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

import { Platform, Dimensions } from 'react-native';
import { Constants } from 'expo';
import Item from './Item';
import Separator from './Separator';
import Header from './Header';
import Footer from './Footer';
import UserCell from './UserCell';

class List extends React.Component {
  renderItem = props => {
    if (this.props.renderItem) {
      return this.props.renderItem(props);
    }

    return <Item {...props} onPress={this.props.onPress} />;
  };

  get userItem() {
    if (this.props.renderUserItem) {
      return this.props.renderUserItem();
    } else {
      console.log('userItem', this.props.userItem);
      return (
        <UserCell
          style={{ backgroundColor: 'white' }}
          item={this.props.userItem}
          onPress={this.props.onPress}
        />
      );
    }
  }

  keyExtractor = (item, index) => `item-${index}`;
  render() {
    const {
      style,
      title,
      userItem,
      onPressHeader,
      onPressFooter,
      onPress,
      headerButtonTitle,
      ...props
    } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          style={[style, styles.container]}
          keyExtractor={this.keyExtractor}
          ListHeaderComponent={headerProps => (
            <Header
              {...headerProps}
              buttonTitle={headerButtonTitle}
              onPress={onPressHeader}
              title={title}
            />
          )}
          ListFooterComponent={footerProps => (
            <Footer {...footerProps} item={userItem} onPress={onPressFooter} />
          )}
          ItemSeparatorComponent={Separator}
          renderItem={this.renderItem}
          {...props}
        />
        {this.userItem}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});

export default List;
