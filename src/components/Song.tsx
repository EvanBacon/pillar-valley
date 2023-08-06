import * as React from "react";

import AudioManager from "../AudioManager";
import { useGlobalAudio } from "../rematch/models";

function Song() {
  const { enabled } = useGlobalAudio();
  console.log("Song", enabled);
  React.useEffect(() => {
    if (enabled) {
      AudioManager.playAsync("song", true);
    } else {
      AudioManager.pauseAsync("song");
    }
    return () => {
      AudioManager.stopAsync("song");
    };
  }, [enabled]);

  return null;
}

export default Song;
