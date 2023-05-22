import * as React from "react";

import Icon from "./Icon";

const PreferencesButton = (props: React.ComponentProps<typeof Icon>) => {
  return <Icon {...props} name="cog" />;
};
export default PreferencesButton;
