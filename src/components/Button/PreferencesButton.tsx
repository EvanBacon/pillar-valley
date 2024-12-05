import type { ComponentProps } from "react";

import Icon from "./Icon";

function PreferencesButton(props: ComponentProps<typeof Icon>) {
  return <Icon {...props} name="gear" fallback="cog" />;
}
export default PreferencesButton;
