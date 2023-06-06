import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import addNth from "../../utils/addNth";
import Avatar from "../Avatar";

export default class Item extends React.Component {
  onPress = () => {
    const { item, index, onPress } = this.props;
    onPress(item, index);
  };
  render() {
    const { index, onPress, style, ...props } = this.props;
    const item = this.props.item || {};

    const {
      displayName,
      score,
      photoURL,
      // rank: brokenRank,
      timestamp,
    } = item;

    const _rankValue = index + 1;
    const rank = _rankValue + addNth(_rankValue);
    return (
      <TouchableHighlight
        underlayColor="#21222D"
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.rank}>{rank}</Text>
            <Avatar
              textStyle={{ fontWeight: "bold" }}
              avatarStyle={{ marginRight: 16 }}
              name={displayName}
              avatar={photoURL}
            />
            <View>
              <Text style={styles.text}>{displayName}</Text>
              <Text style={styles.subtitle}>{score} Points</Text>
            </View>
          </View>
          <Ionicons size={24} color="#D8DADE" name="ios-arrow-forward" />
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
  },
  rank: {
    alignSelf: "center",
    fontSize: 24,
    minWidth: 24,
    marginRight: 8,
    color: "#fff",
  },
  text: { fontWeight: "bold", color: "#fff" },
  subtitle: {
    opacity: 0.7,
    color: "#fff",
  },
});
