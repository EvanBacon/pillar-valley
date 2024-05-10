import Constants from "expo-constants";
import React from "react";
import { Share } from "react-native";

import Icon from "./Icon";
import storeUrl from "../../utils/storeUrl";

import { logEvent } from "@/lib/Analytics";
import { useGameScreenshot, useScore } from "@/zustand/models";

class ShareButton extends React.Component {
  onPress = async () => {
    const { score, screenshot: url } = this.props;
    // const url = await AssetUtils.uriAsync(image);
    const appName = Constants.expoConfig?.name;
    const title = `${appName}`;
    const message = `OMG! I got ${score} points in @baconbrix ${appName}. ${
      storeUrl() || ""
    }`;
    logEvent("share", { score });
    Share.share(
      {
        message,
        title,
        url,
      },
      {
        tintColor: "#F09458",
        excludedActivityTypes: [
          "com.apple.UIKit.activity.Print",
          "com.apple.UIKit.activity.AssignToContact",
          "com.apple.UIKit.activity.AddToReadingList",
          "com.apple.UIKit.activity.AirDrop",
          "com.apple.UIKit.activity.OpenInIBooks",
          "com.apple.UIKit.activity.MarkupAsPDF",
          "com.apple.reminders.RemindersEditorExtension", // Reminders
          "com.apple.mobilenotes.SharingExtension", // Notes
          "com.apple.mobileslideshow.StreamShareService", // iCloud Photo Sharing - This also does nothing :{
        ],
      }
    );
    if (this.props.onPress) this.props.onPress();
  };

  render() {
    const { onPress, screenshot, name, ...props } = this.props;
    if (!screenshot) {
      return null;
    }
    return (
      <Icon
        onPress={this.onPress}
        name="square.and.arrow.up"
        fallback="share"
        {...props}
      />
    );
  }
}

function OuterShareButton(props) {
  const { screenshot } = useGameScreenshot();
  const {
    score: { last: score },
  } = useScore();
  return <ShareButton {...props} score={score} screenshot={screenshot} />;
}

export default OuterShareButton;
