import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import Footer from "./Footer";
import Header from "./Header";
import Item from "./Item";
import Separator from "./Separator";
import UserCell from "./UserCell";

import { Slate } from "@/src/constants/Colors";

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
          style={[style, { backgroundColor: Slate["800"] }]}
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

export default List;
