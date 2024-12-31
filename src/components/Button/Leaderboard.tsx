import * as React from "react";

import Icon from "./Icon";

const LeaderboardButton = React.forwardRef(
  (props: React.ComponentProps<typeof Icon>, ref) => {
    return <Icon {...props} ref={ref} name="trophy" />;
  }
);

LeaderboardButton.displayName = "LeaderboardButton";
export default LeaderboardButton;
