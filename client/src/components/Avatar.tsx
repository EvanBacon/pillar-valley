import React from "react";
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageProps,
} from "react-native";
import { TextProps } from "@expo/html-elements/build/primitives/Text";

// https://github.com/FaridSafi/react-native-gifted-chat/blob/master/src/GiftedAvatar.js
const Color = {
  white: "white",
  carrot: "#e67e22",
  emerald: "#2ecc71",
  peterRiver: "#3498db",
  wisteria: "#8e44ad",
  alizarin: "#e74c3c",
  turquoise: "#1abc9c",
  midnightBlue: "#2c3e50",
};

const {
  carrot,
  emerald,
  peterRiver,
  wisteria,
  alizarin,
  turquoise,
  midnightBlue,
} = Color;
// TODO
// 3 words name initials
// handle only alpha numeric chars

export default class Avatar extends React.PureComponent<{
  color?: string;
  name: string;
  onPress: (other: any) => void;
  avatar: Function | number;
  textStyle: TextProps["style"];
  avatarStyle: ImageProps["style"];
}> {
  avatarName?: string;
  avatarColor?: string;

  setAvatarColor() {
    const userName = this.props.name || "";
    const name = userName.toUpperCase().split(" ");
    if (name.length === 1) {
      this.avatarName = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      this.avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      this.avatarName = "";
    }

    let sumChars = 0;
    for (let i = 0; i < userName.length; i += 1) {
      sumChars += userName.charCodeAt(i);
    }

    // inspired by https://github.com/wbinnssmith/react-user-avatar
    // colors from https://flatuicolors.com/
    const colors = [
      carrot,
      emerald,
      peterRiver,
      wisteria,
      alizarin,
      turquoise,
      midnightBlue,
    ];

    this.avatarColor = colors[sumChars % colors.length];
  }

  renderAvatar() {
    if (typeof this.props.avatar === "function") {
      return this.props.avatar();
    } else if (typeof this.props.avatar === "string") {
      return (
        <Image
          source={{ uri: this.props.avatar }}
          style={[styles.avatarStyle, this.props.avatarStyle]}
        />
      );
    } else if (typeof this.props.avatar === "number") {
      return (
        <Image
          source={this.props.avatar}
          style={[styles.avatarStyle, this.props.avatarStyle]}
        />
      );
    }
    return null;
  }

  renderInitials() {
    return (
      <Text style={[styles.textStyle, this.props.textStyle]}>
        {this.avatarName}
      </Text>
    );
  }

  render() {
    if (!this.props.name && !this.props.avatar) {
      // render placeholder
      return (
        <View
          style={[
            styles.avatarStyle,
            styles.avatarTransparent,
            this.props.avatarStyle,
          ]}
          accessibilityTraits="image"
        />
      );
    }
    if (this.props.avatar) {
      return (
        <TouchableOpacity
          disabled={!this.props.onPress}
          style={{ flex: 1 }}
          onPress={() => {
            const { onPress, ...other } = this.props;
            if (this.props.onPress) {
              this.props.onPress(other);
            }
          }}
          accessibilityTraits="image"
        >
          {this.renderAvatar()}
        </TouchableOpacity>
      );
    }

    this.setAvatarColor();

    return (
      <TouchableOpacity
        disabled={!this.props.onPress}
        onPress={() => {
          const { onPress, ...other } = this.props;
          if (this.props.onPress) {
            this.props.onPress(other);
          }
        }}
        style={[
          styles.avatarStyle,
          { backgroundColor: this.props.color ?? this.avatarColor },
          this.props.avatarStyle,
        ]}
        accessibilityTraits="image"
      >
        {this.renderInitials()}
      </TouchableOpacity>
    );
  }
}

const styles = {
  avatarStyle: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    maxWidth: 40,
    maxHeight: 40,
    minHeight: 40,
    aspectRatio: 1,
    flex: 1,
    borderRadius: 20,
  },
  avatarTransparent: {
    backgroundColor: "#B8B8B8",
  },
  textStyle: {
    color: Color.white,
    fontSize: 16,
    backgroundColor: Color.backgroundTransparent,
    fontWeight: "100",
  },
};

Avatar.defaultProps = {
  name: null,
  avatar: null,
  onPress: null,
  avatarStyle: {},
  textStyle: {},
};
