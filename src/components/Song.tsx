import * as React from "react";

import AudioManager from "../AudioManager";
import { useGlobalAudio } from "../rematch/models";

function Song() {
  const { muted } = useGlobalAudio();
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

export default Song;
