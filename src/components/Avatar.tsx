import React, { FC } from "react";
import {
  Image,
  Text,
  ViewStyle,
  TouchableOpacity,
  View,
  TextStyle,
  ImageStyle,
  StyleProp,
} from "react-native";

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

type AvatarProps = {
  color?: string | false;
  name?: string;
  onPress?: (other: AvatarProps) => void;
  avatar?: (() => JSX.Element) | string | number;
  textStyle?: StyleProp<TextStyle>;
  avatarStyle?: StyleProp<Pick<ViewStyle | ImageStyle, "marginRight">>;
};

const colors = [
  carrot,
  emerald,
  peterRiver,
  wisteria,
  alizarin,
  turquoise,
  midnightBlue,
];
const Avatar: FC<AvatarProps> = ({
  color,
  name,
  onPress,
  avatar,
  textStyle,
  avatarStyle,
}) => {
  const userName = name || "";
  const nameArr = userName.toUpperCase().split(" ");
  let avatarName = "";
  if (nameArr.length === 1) {
    avatarName = `${nameArr[0].charAt(0)}`;
  } else if (nameArr.length > 1) {
    avatarName = `${nameArr[0].charAt(0)}${nameArr[1].charAt(0)}`;
  }
  let sumChars = 0;
  for (let i = 0; i < userName.length; i += 1) {
    sumChars += userName.charCodeAt(i);
  }

  const avatarColor = colors[sumChars % colors.length];

  const handlePress = () =>
    onPress?.({ color, name, onPress, avatar, textStyle, avatarStyle });

  if (!name && !avatar) {
    return (
      <View
        style={[styles.avatarStyle, styles.avatarTransparent, avatarStyle]}
      />
    );
  }

  if (avatar) {
    return (
      <TouchableOpacity
        disabled={!onPress}
        onPress={handlePress}
        style={{ flex: 1 }}
      >
        {typeof avatar === "function" ? (
          avatar()
        ) : (
          <Image
            source={typeof avatar === "string" ? { uri: avatar } : avatar}
            style={[styles.avatarStyle, avatarStyle]}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={[
        styles.avatarStyle,
        { backgroundColor: color || avatarColor },
        avatarStyle,
      ]}
    >
      <Text style={[styles.textStyle, textStyle]}>{avatarName}</Text>
    </TouchableOpacity>
  );
};

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
  } as ViewStyle,
  avatarTransparent: {
    backgroundColor: "#B8B8B8",
  } as ViewStyle,
  textStyle: {
    color: Color.white,
    fontSize: 16,
    backgroundColor: "transparent",
    fontWeight: "100",
  } as TextStyle,
};

export default Avatar;
