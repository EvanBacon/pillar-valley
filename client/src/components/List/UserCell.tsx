import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import Avatar from "../Avatar";

export default class UserCell extends React.Component {
  static defaultProps = {
    item: {},
    index: 0,
    onPress: () => {
      alert("must override UserCell.onPress"); // eslint-disable-line
    },
  };
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };
  render() {
    const { index, onPress, style, item, ...props } = this.props;
    if (!item) {
      return <View />;
    }

    const {
      displayName: name,
      score,
      // rank,
      photoURL: image,
    } = item;
    // const _rank = rank || index + 1;
    return (
      <TouchableHighlight
        underlayColor="#eeeeee"
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.rank, { alignSelf: "center" }]}>ME</Text>
            <Avatar
              textStyle={{ fontWeight: "bold" }}
              avatarStyle={{ marginRight: 16 }}
              name={name}
              avatar={image}
            />
            <View styles={{ alignItems: "flex-start" }}>
              <Text style={styles.rank}>{name}</Text>
              <Text style={styles.text}>
                <Text style={styles.subtitle}>{score} Points</Text>
              </Text>
            </View>
          </View>
          {onPress && (
            <Ionicons size={24} color="#CCCCCC" name="ios-arrow-forward" />
          )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.3)",
  },
  rank: {
    fontSize: 24,
    minWidth: 36,
    marginRight: 8,
  },
  text: { fontWeight: "bold", fontSize: 16 },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});
