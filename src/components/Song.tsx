import * as React from "react";
import { connect } from "react-redux";

import AudioManager from "../AudioManager";

function Song({ muted }: { muted: boolean }) {
  React.useEffect(() => {
    if (muted) {
      AudioManager.pauseAsync("song");
    } else {
      AudioManager.playAsync("song", true);
    }
    return () => {
      AudioManager.stopAsync("song");
    };
  }, [muted]);

  return null;
}

export default connect(({ muted }: { muted: boolean }) => ({ muted }))(Song);
