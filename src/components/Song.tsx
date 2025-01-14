import * as React from "react";

import { useGlobalAudio } from "../zustand/models";
import { Audio } from "expo-av";

const SONG_FILE = require("@/assets/audio/song.mp3");

function SongClient() {
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
    } else {
      soundObject.then(({ sound }) => sound.pauseAsync());
    }
    return () => {
      soundObject.then(({ sound }) => sound.stopAsync());
    };
  }, [enabled, soundObject]);

  return null;
}

export const Song = typeof window === "undefined" ? () => null : SongClient;

export default Song;
