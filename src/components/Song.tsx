import * as React from "react";

import AudioManager from "../AudioManager";
import { useGlobalAudio } from "../zustand/models";

function Song() {
  const { enabled } = useGlobalAudio();

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
