import { connectActionSheet } from "@expo/react-native-action-sheet";
import React from "react";
import { StyleSheet, View } from "react-native";

import AchievementsItem from "../components/AchievementsItem";
import List from "../components/List";
import Challenges from "../constants/Achievements";

const challengesListData = Object.keys(Challenges).map((key) => ({
  key,
  ...Challenges[key],
}));
function AchievementScreen({ showActionSheetWithOptions, achievements }) {
  const [filter, setFilter] = React.useState("All");

  const _onOpenActionSheet = () => {
    console.log("pressed");
    const options = ["All", "Completed", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex: cancelButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex: number) => {
        if (buttonIndex !== cancelButtonIndex) {
          setFilter(options[buttonIndex]);
        }
      }
    );
  };

  const data = React.useMemo(() => {
    if (filter.toLowerCase() === "completed") {
      return challengesListData.filter(({ key }) => achievements[key]);
    }
    return challengesListData.sort((a, b) => {
      if (achievements[b.key] || achievements[a.key]) return -1;
      return 1;
    });
  }, [achievements, filter]);

  return (
    <View style={styles.container}>
      <List
        noMore
        renderItem={({ item, index }) => (
          <AchievementsItem
            onPress={() => {}}
            {...item}
            index={index}
            complete={achievements[item.key]}
          />
        )}
        title={`${data.length} Challenges`}
        headerButtonTitle={`Showing ${filter}`}
        data={data}
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

import { connect } from "react-redux";
const ConnectedScreen = connect(({ achievements }) => ({ achievements }))(
  AchievementScreen
);

export default connectActionSheet(ConnectedScreen);
