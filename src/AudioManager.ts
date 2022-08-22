import { store } from "./rematch/store";
import { Audio } from "expo-av";
import { Platform } from "react-native";

const audio = {
  // Common
  "button_in.wav": require("./assets/audio/button_in.wav"),
  "button_out.wav": require("./assets/audio/button_out.wav"),
  "unlock.mp3": require("./assets/audio/unlock.mp3"),
  // Pillar Valley
  "song.mp3": require("./assets/audio/song.mp3"),
  // Nitro Roll
  // "bass_00.mp3": require("./NitroRoll/audio/bass_00.mp3"),
  // "bass_01.mp3": require("./NitroRoll/audio/bass_01.mp3"),
  // "bass_02.mp3": require("./NitroRoll/audio/bass_02.mp3"),
  // "bass_03.mp3": require("./NitroRoll/audio/bass_03.mp3"),
  // "bass_04.mp3": require("./NitroRoll/audio/bass_04.mp3"),
  // "bass_05.mp3": require("./NitroRoll/audio/bass_05.mp3"),
  // "bass_06.mp3": require("./NitroRoll/audio/bass_06.mp3"),
  // "bass_07.mp3": require("./NitroRoll/audio/bass_07.mp3"),
  // "bass_08.mp3": require("./NitroRoll/audio/bass_08.mp3"),
  // "pop_00.mp3": require("./NitroRoll/audio/pop_00.mp3"),
  // "pop_00.wav": require("./NitroRoll/audio/pop_00.wav"),
  // "pop_01.wav": require("./NitroRoll/audio/pop_01.wav"),
  // "song.mp3": require("./NitroRoll/audio/song.mp3"),
};

// eslint-disable-line
class AudioManager {
  sounds: Record<string, Audio.Sound> = {};

  playAsync = async (name: string, isLooping: boolean = false) => {
    if (store.getState().muted || Platform.OS === "web") {
      return;
    }

    if (name in this.sounds) {
      const soundObject = this.sounds[name];
      try {
        await soundObject.setPositionAsync(0);
        await soundObject.setIsLoopingAsync(isLooping);
        await soundObject.playAsync();
      } catch (error) {
        console.warn("Error playing audio", { error });
      }
    } else {
      console.warn("Audio doesn't exist", name);
    }
  };
  stopAsync = async (name: string) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name];
      try {
        await soundObject.stopAsync();
      } catch (error) {
        console.warn("Error stopping audio", { error });
      }
    } else {
      console.warn("Audio doesn't exist", name);
    }
  };
  volumeAsync = async (name: string, volume: number) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name];
      try {
        await soundObject.setVolumeAsync(volume);
      } catch (error) {
        console.warn("Error setting volume of audio", { error });
      }
    } else {
      console.warn("Audio doesn't exist", name);
    }
  };

  pauseAsync = async (name: string) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name];
      try {
        await soundObject.pauseAsync();
      } catch (error) {
        console.warn("Error pausing audio", { error });
      }
    } else {
      console.warn("Audio doesn't exist", name);
    }
  };

  configureExperienceAudioAsync = async () =>
    Audio.setAudioModeAsync({
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });

  assets: Record<string, number> = audio;

  setupAudioAsync = async (): Promise<void> => {
    const keys = Object.keys(this.assets || {});
    for (const key of keys) {
      const item = this.assets[key];
      const { sound } = await Audio.Sound.createAsync(item);
      const soundName = key.substr(0, key.lastIndexOf("."));
      // console.log("Audio", soundName, sound);
      this.sounds[soundName] = sound;
    }
  };

  setupAsync = async () => {
    await this.configureExperienceAudioAsync();
    await this.setupAudioAsync();
  };
}

export default new AudioManager();
