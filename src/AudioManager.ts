import { Audio } from "expo-av";
import { Platform } from "react-native";

import { useGlobalAudio } from "./zustand/models";

const audio = {
  // Common
  button_in: require("./assets/audio/button_in.wav"),
  button_out: require("./assets/audio/button_out.wav"),
  unlock: require("./assets/audio/unlock.mp3"),
  // Pillar Valley
  // "song.mp3": require("./assets/audio/song.mp3"),
};

// eslint-disable-line
class AudioManager {
  private _pending: Map<string, ReturnType<typeof Audio.Sound.createAsync>> =
    new Map();
  sounds: Record<string, Audio.Sound> = {};

  private loadAsync = async (name: string) => {
    await this.setupAsync();

    const item = this.assets[name];
    const pending = this._pending.get(name) ?? Audio.Sound.createAsync(item);
    if (!this._pending.has(name)) {
      this._pending.set(name, pending);
    }
    const { sound } = await pending;
    const soundName = name.substr(0, name.lastIndexOf("."));
    this.sounds[soundName] = sound;
    return sound;
  };

  playAsync = async (name: string, isLooping: boolean = false) => {
    if (!useGlobalAudio.getState().enabled || Platform.OS === "web") {
      return;
    }

    const soundObject = await this.loadAsync(name);
    try {
      await soundObject.setPositionAsync(0);
      await soundObject.setIsLoopingAsync(isLooping);
      await soundObject.playAsync();
    } catch (error) {
      console.warn("Error playing audio", { error });
    }
  };
  stopAsync = async (name: string) => {
    await (await this.loadAsync(name)).stopAsync();
  };
  volumeAsync = async (name: string, volume: number) => {
    await (await this.loadAsync(name)).setVolumeAsync(volume);
  };

  pauseAsync = async (name: string) => {
    await (await this.loadAsync(name)).pauseAsync();
  };

  async configureExperienceAudioAsync() {
    return Audio.setAudioModeAsync({
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
  }

  private assets: Record<string, number> = audio;

  _isSetup = false;
  setupPromise: Promise<void> | null = null;
  setupAsync = async () => {
    if (this._isSetup) {
      return this.setupPromise;
    }
    this._isSetup = true;
    this.setupPromise = (async () => {
      await this.configureExperienceAudioAsync();
      this.setupPromise = null;
    })();
    return this.setupPromise;
  };
}

export default new AudioManager();
