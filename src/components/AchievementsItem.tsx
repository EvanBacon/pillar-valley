import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";

export default class Item extends React.Component {
  onPress = () => {
    // const { index, onPress } = this.props;
    // onPress(index);
  };

  get icon() {
    const { complete } = this.props;
    const style = { marginLeft: 12 };
    if (complete) {
      return (
        <MaterialIcons style={style} size={24} color="green" name="check" />
      );
    }
    return (
      <MaterialIcons
        style={style}
        size={24}
        color="gray"
        name="hourglass-empty"
      />
    );
  }

  get description() {
    return this.props.isSecret ? "Secret Achievement" : this.props.description;
  }
  render() {
    const {
      name,
      points,
      isSecret,
      image,
      index,
      onPress,
      style,
      ...props
    } = this.props;
    return (
      <TouchableHighlight
        underlayColor="#eeeeee"
        {...props}
        onPress={this.onPress}
        style={[styles.touchable, style]}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: "row", maxWidth: "50%" }}>
            <Avatar
              textStyle={{ fontWeight: "bold" }}
              avatarStyle={{ marginRight: 16 }}
              name={name}
              avatar={image}
              color={!this.props.complete && "gray"}
            />
            <View style={{ justifyContent: "center" }}>
              <Text style={styles.text}>{name}</Text>
              {this.description && (
                <Text style={styles.subtitle}>{this.description}</Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {points && (
              <ScoreBadge style={{}} color="white">
                {points}
              </ScoreBadge>
            )}

            {this.icon}
          </View>
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
  text: { fontWeight: "bold" },
  subtitle: {
    opacity: 0.7,
  },
});
