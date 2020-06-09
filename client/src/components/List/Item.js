import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import addNth from "../../utils/addNth";
import Avatar from "../Avatar";
import TimeAgo from "../TimeAgo";

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
        underlayColor="#eeeeee"
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
              {score && <TimeAgo>{timestamp}</TimeAgo>}
            </View>
          </View>
          <Ionicons size={24} color="#CCCCCC" name="ios-arrow-forward" />
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
  },
  text: { fontWeight: "bold" },
  subtitle: {
    opacity: 0.7,
  },
});
