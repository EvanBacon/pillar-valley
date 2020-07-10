import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import Footer from "./Footer";
import Item from "./Item";
import Separator from "./Separator";
import UserCell from "./UserCell";
import Header from "./Header";

class List extends React.Component {
  get userItem() {
    if (this.props.renderUserItem) {
      return this.props.renderUserItem();
    }
    return (
      <UserCell
        style={{ backgroundColor: "white" }}
        item={this.props.userItem}
        onPress={this.props.onPress}
      />
    );
  }

  get footer() {
    if (this.props.noMore) {
      return null;
    }

    return (footerProps) => (
      <Footer
        {...footerProps}
        item={this.props.userItem}
        onPress={this.props.onPressFooter}
      />
    );
  }

  keyExtractor = (item, index) => `item-${index}`;

  renderItem = (props) => {
    if (this.props.renderItem) {
      return this.props.renderItem(props);
    }

    return <Item {...props} onPress={this.props.onPress} />;
  };

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
          renderItem={this.renderItem}
          ListHeaderComponent={(headerProps) => (
            <Header
              {...headerProps}
              buttonTitle={headerButtonTitle}
              onPress={onPressHeader}
              title={title}
            />
          )}
          {...props}
        />
        {this.userItem}
      </View>
    );
  }
}

// ListEmptyComponent={
//   <View
//     style={{
//       justifyContent: 'center',
//       flex: 1,
//       height: Dimensions.get('window').height / 2,
//       alignItems: 'center',
//     }}
//   >
//     <Text style={{ fontSize: 24 }}>Coming Soon</Text>
//   </View>
// }

const styles = StyleSheet.create({
  container: {},
});

export default List;
