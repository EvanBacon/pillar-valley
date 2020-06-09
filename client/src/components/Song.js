import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import AudioManager from "../AudioManager";

function Song({ muted }) {
  React.useEffect(() => {
    if (muted) {
      AudioManager.shared.pauseAsync("song");
    } else {
      AudioManager.shared.playAsync("song", true, false);
    }
    return () => AudioManager.shared.stopAsync("song");
  }, [muted]);

  return null;
}

export default connect(({ muted }) => ({ muted }))(Song);
