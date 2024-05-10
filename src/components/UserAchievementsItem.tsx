import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import ScoreBadge from "./ScoreBadge";
import { SF } from "./sf-symbol";

interface UserAchievementsItemProps {
  data: {
    complete: boolean;
    points: number;
  }[];
  index: number;
  onPress: (item: any, index: number) => void;
  style?: object;
  item?: any;
}

const UserAchievementsItem: React.FC<UserAchievementsItemProps> = ({
  data,
  index,
  onPress,
  style,
  item,
}) => {
  const [completed, setCompleted] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (data) {
      const completedItems = data.filter((item) => item.complete);
      console.log(completedItems);
      setCompleted(completedItems);
      setScore(completedItems.reduce((total, item) => total + item.points, 0));
    }
  }, [data]);

  const handlePress = () => {
    onPress(item, index);
  };

  return (
    <TouchableHighlight
      underlayColor="#eeeeee"
      onPress={handlePress}
      style={[styles.touchable, style]}
    >
      <View style={styles.container}>
        <Text style={styles.rank}>
          Completed {completed.length}/{data.length}
        </Text>
        <ScoreBadge color="white">{score}</ScoreBadge>

        {onPress && (
          <SF
            size={24}
            color="#CCCCCC"
            fallback="arrow-forward"
            name="arrow.right"
          />
        )}
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.3)",
  },
  rank: {
    fontSize: 18,
    marginRight: 8,
  },
  text: { fontWeight: "bold", fontSize: 16 },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default UserAchievementsItem;
