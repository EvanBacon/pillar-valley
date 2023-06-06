import { connectActionSheet } from "@expo/react-native-action-sheet";
import React from "react";

import AchievementsItem from "@/src/components/AchievementsItem";
import List from "@/src/components/List";
import Challenges from "@/src/constants/Achievements";
import { useAchievements } from "@/src/rematch/models";

const challengesListData = Object.keys(Challenges).map((key) => ({
  key,
  ...Challenges[key],
}));
function AchievementScreen({ showActionSheetWithOptions }) {
  const { achievements } = useAchievements();
  const [filter, setFilter] = React.useState("All");

  const _onOpenActionSheet = () => {
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
  );
}

export default connectActionSheet(AchievementScreen);
