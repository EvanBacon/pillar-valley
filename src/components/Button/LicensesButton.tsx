import * as React from "react";

import Icon from "./Icon";

const LicensesButton = React.forwardRef(
  (props: React.ComponentProps<typeof Icon>, ref) => {
    return <Icon {...props} ref={ref} name="handshake-o" />;
  }
);
export default LicensesButton;
