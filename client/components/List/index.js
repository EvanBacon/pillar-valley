import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';

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

  get footer() {
    if (this.props.noMore) {
      return null;
    }

    return footerProps => (
      <Footer
        {...footerProps}
        item={this.props.userItem}
        onPress={this.props.onPressFooter}
      />
    );
  }
  render() {
    const {
      style,
      title,
      userItem,
      onPressHeader,
      onPressFooter,
      onPress,
      headerButtonTitle,
      noMore,
      ...props
    } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          style={[style, styles.container]}
          keyExtractor={this.keyExtractor}
          ListFooterComponent={this.footer}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <View
              style={{
                justifyContent: 'center',
                flex: 1,
                height: Dimensions.get('window').height / 2,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>Coming Soon</Text>
            </View>
          }
          renderItem={this.renderItem}
          {...props}
        />
        {this.userItem}
      </View>
    );
  }
}

// ListHeaderComponent={headerProps => (
//             <Header
//               {...headerProps}
//               buttonTitle={headerButtonTitle}
//               onPress={onPressHeader}
//               title={title}
//             />
//           )}

const styles = StyleSheet.create({
  container: {},
});

export default List;
