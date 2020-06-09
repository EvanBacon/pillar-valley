import * as React from "react";

import Icon from "./Icon";

const LeaderboardButton = React.forwardRef((props, ref) => {
  return <Icon {...props} ref={ref} name="trophy" />;
});
export default LeaderboardButton;
