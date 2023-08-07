import React, { FC } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import Footer from "./Footer";
import Header from "./Header";
import Item from "./Item";
import Separator from "./Separator";
import UserCell from "./UserCell";

import { Slate } from "@/constants/Colors";

interface ListProps {
  style?: StyleProp<ViewStyle>;
  title?: string;
  userItem?: any; // replace with a more specific type if possible
  onPressHeader?: () => void;
  onPressFooter?: () => void;
  onPress?: () => void;
  headerButtonTitle?: string;
  noMore?: boolean;
  renderUserItem?: () => JSX.Element;
  renderItem?: (props: any) => JSX.Element; // replace any with a more specific type if possible
  // other props used by FlatList can also be included here
}

const List: FC<ListProps> = ({
  style,
  title,
  userItem,
  onPressHeader,
  onPressFooter,
  onPress,
  headerButtonTitle,
  noMore,
  renderUserItem,
  renderItem,
  ...props
}) => {
  const userItemComponent = renderUserItem ? (
    renderUserItem()
  ) : (
    <UserCell
      style={{ backgroundColor: "white" }}
      item={userItem}
      onPress={onPress}
    />
  );

  const footerComponent = noMore
    ? null
    : (footerProps) => (
        <Footer {...footerProps} item={userItem} onPress={onPressFooter} />
      );

  const keyExtractor = (item: any, index: number) => `item-${index}`; // replace any with a more specific type if possible

  const renderItemComponent = (props: any) => {
    // replace any with a more specific type if possible
    if (renderItem) {
      return renderItem(props);
    }

    return <Item {...props} onPress={onPress} />;
  };

  return (
    <>
      <FlatList
        style={[style, { flex: 1, backgroundColor: Slate["800"] }]}
        keyExtractor={keyExtractor}
        ListFooterComponent={footerComponent}
        ItemSeparatorComponent={Separator}
        renderItem={renderItemComponent}
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
      {userItemComponent}
    </>
  );
};

export default List;
