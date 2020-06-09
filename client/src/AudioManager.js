import { store } from "./rematch/Gate";
import { Audio } from "expo-av";
// eslint-disable-line
class AudioManager {
  sounds = {};

  playAsync = async (name, isLooping) => {
    if (store.getState().muted) {
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
  stopAsync = async (name) => {
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
  volumeAsync = async (name, volume) => {
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

  pauseAsync = async (name) => {
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
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });

  get assets() {
    return {
      "button_in.wav": require("./assets/audio/button_in.wav"),
      "button_out.wav": require("./assets/audio/button_out.wav"),
      "song.mp3": require("./assets/audio/song.mp3"),
    };
  }

  setupAudioAsync = async () => {
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

AudioManager.shared = new AudioManager();

export default AudioManager;
