import * as React from "react";

import Icon from "./Icon";

const ChallengesButton = React.forwardRef((props, ref) => {
  return <Icon {...props} ref={ref} name="trophy" />;
});
export default ChallengesButton;
