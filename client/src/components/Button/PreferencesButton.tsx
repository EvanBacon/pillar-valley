import * as React from "react";

import Icon from "./Icon";

const PreferencesButton = React.forwardRef(
  (props: React.ComponentProps<typeof Icon>, ref) => {
    return <Icon {...props} ref={ref} name="cog" />;
  }
);
export default PreferencesButton;
