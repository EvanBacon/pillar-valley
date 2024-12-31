import * as React from "react";

// import AudioManager from "../AudioManager";
import { useGlobalAudio } from "../zustand/models";
import { Audio } from "expo-av";

const SONG_FILE = require("@/assets/audio/song.mp3");

function Song() {
  const { enabled } = useGlobalAudio();

  const soundObject = Audio.Sound.createAsync(SONG_FILE, {
    isLooping: true,
  });

  React.useEffect(() => {
    if (enabled) {
      soundObject.then(async ({ sound }) => {
        await sound.setPositionAsync(0);
        await sound.setIsLoopingAsync(true);
        sound.playAsync();
      });
      // AudioManager.playAsync("song", true);
    } else {
      soundObject.then(({ sound }) => sound.pauseAsync());

      // AudioManager.pauseAsync("song");
    }
    return () => {
      soundObject.then(({ sound }) => sound.stopAsync());
      // AudioManager.stopAsync("song");
    };
  }, [enabled, soundObject]);

  return null;
}

export default Song;
