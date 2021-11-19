import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Separator from "../List/Separator";
import Header from "./Header";
import Item from "./Item";

function List({
  style,
  title,
  onPress,
  onPressHeader,
  headerButtonTitle,
  ...props
}) {
  const keyExtractor = (item, index) => `item-${index}`;
  const renderItem = (props) => <Item {...props} onPress={onPress} />;

  const { bottom } = useSafeAreaInsets();
  return (
    <FlatList
      style={[style, styles.container]}
      keyExtractor={keyExtractor}
      ListHeaderComponent={(headerProps) => (
        <Header
          {...headerProps}
          buttonTitle={headerButtonTitle}
          onPress={onPressHeader}
          title={title}
        />
      )}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{ paddingBottom: bottom }}
      renderItem={renderItem}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
});

export default List;
