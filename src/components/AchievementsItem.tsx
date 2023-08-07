import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native";

import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";

interface ItemProps {
  complete?: boolean;
  isSecret?: boolean;
  description?: string;
  name: string;
  points?: number;
  image?: string;
  index?: number;
  onPress?: (index?: number) => void;
  style?: StyleProp<ViewStyle>;
}

const Item: React.FC<ItemProps> = ({
  complete,
  isSecret,
  description,
  name,
  points,
  image,
  index,
  onPress,
  style,
  ...props
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(index);
    }
  };

  const icon = complete ? (
    <MaterialIcons style={styles.icon} size={24} color="green" name="check" />
  ) : (
    <MaterialIcons
      style={styles.icon}
      size={24}
      color="#D8DADE"
      name="hourglass-empty"
    />
  );

  const actualDescription = isSecret ? "Secret Achievement" : description;

  return (
    <TouchableHighlight
      underlayColor="#191A23"
      {...props}
      onPress={handlePress}
      style={[styles.touchable, style]}
    >
      <View style={styles.container}>
        <View style={styles.nameView}>
          <Avatar
            textStyle={{ fontWeight: "bold" }}
            avatarStyle={{ marginRight: 16 }}
            name={name}
            avatar={image}
            color={!complete && "#919497"}
          />
          <View style={styles.textContainer}>
            <Text style={styles.text}>{name}</Text>
            {actualDescription && (
              <Text style={styles.subtitle}>{actualDescription}</Text>
            )}
          </View>
        </View>
        <View style={styles.pointsView}>
          {points && <ScoreBadge color="white">{points}</ScoreBadge>}

          {icon}
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  touchable: {},
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameView: {
    flexDirection: "row",
    maxWidth: "50%",
  },
  textContainer: {
    justifyContent: "center",
  },
  pointsView: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    opacity: 0.7,
  },
  icon: {
    marginLeft: 12,
  },
});

export default Item;
