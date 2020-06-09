import { dispatch } from "@rematch/core";
import * as React from "react";
import { connect } from "react-redux";

import Icon from "./Icon";

function SoundButton({ muted }) {
  const onPress = React.useMemo(
    () => () => {
      dispatch.muted.toggle();
    },
    []
  );

  return <Icon onPress={onPress} name={muted ? "volume-off" : "volume-up"} />;
}

export default connect(({ muted }) => ({ muted }))(SoundButton);
