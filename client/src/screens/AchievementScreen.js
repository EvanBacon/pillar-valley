import { connectActionSheet } from "@expo/react-native-action-sheet";
import React from "react";
import { StyleSheet, View } from "react-native";

import AchievementsItem from "../components/AchievementsItem";
import List from "../components/List";
import Achievements from "../constants/Achievements";
import connectAchievementToast from "../ExpoParty/connectAchievementToast";

function AchievementScreen({ showActionSheetWithOptions }) {
  const [filter, setFilter] = React.useState("All");

  const _onOpenActionSheet = () => {
    const options = ["All", "Completed", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          setFilter(options[buttonIndex]);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <List
        noMore
        renderItem={({ item, index }) => (
          <AchievementsItem onPress={() => {}} {...item} index={index} />
        )}
        title={`${Achievements.length} Achievements`}
        headerButtonTitle={filter}
        data={Achievements}
        renderUserItem={(props) => null}
        onPress={() => {}}
        onPressHeader={_onOpenActionSheet}
        onPressFooter={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
});

export default connectActionSheet(connectAchievementToast(AchievementScreen));
