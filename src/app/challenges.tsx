import { connectActionSheet } from "@expo/react-native-action-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { loadAsync } from "expo-font";
import Head from "expo-router/head";
import React from "react";

import AchievementsItem from "@/components/AchievementsItem";
import List from "@/components/List";
import Challenges from "@/constants/Achievements";
import { useAchievements } from "@/zustand/models";

const challengesListData = Object.keys(Challenges).map((key) => ({
  key,
  ...Challenges[key],
}));

function AchievementScreen({ showActionSheetWithOptions }) {
  // Ensure this font is extracted for static web.
  loadAsync(MaterialIcons.font);

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
    <>
      <Head>
        <title>Challenges</title>
        <meta property="og:title" content="Challenges | Pillar Valley" />
      </Head>
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
    </>
  );
}

export default connectActionSheet(AchievementScreen);
