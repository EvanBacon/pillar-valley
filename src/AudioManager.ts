import { Audio } from "expo-av";
import { Platform } from "react-native";
import { useGlobalAudio } from "./zustand/models";

const audio = {
  // Common
  "button_in.wav": require("./assets/audio/button_in.wav"),
  "button_out.wav": require("./assets/audio/button_out.wav"),
  "unlock.mp3": require("./assets/audio/unlock.mp3"),
  // Pillar Valley
  "song.mp3": require("./assets/audio/song.mp3"),
};

// eslint-disable-line
class AudioManager {
  sounds: Record<string, Audio.Sound> = {};

  playAsync = async (name: string, isLooping: boolean = false) => {
    if (!useGlobalAudio.getState().enabled || Platform.OS === "web") {
      return;
    }

    await this.setupAsync();

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
      console.warn(
        `Audio "${name}" doesn't exist. Expected: ${Object.keys(
          this.sounds
        ).join(", ")}`
      );
    }
  };
  stopAsync = async (name: string) => {
    await this.setupAsync();
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
    await this.setupAsync();
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
    await this.setupAsync();
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

  private async setupAudioAsync(): Promise<void> {
    const keys = Object.keys(this.assets || {});
    for (const key of keys) {
      const item = this.assets[key];
      const { sound } = await Audio.Sound.createAsync(item);
      const soundName = key.substr(0, key.lastIndexOf("."));
      // console.log("Audio", soundName, sound);
      this.sounds[soundName] = sound;
    }
  }

  _isSetup = false;
  setupPromise: Promise<void> | null = null;
  setupAsync = async () => {
    if (this._isSetup) {
      return this.setupPromise;
    }
    this._isSetup = true;
    this.setupPromise = (async () => {
      await this.configureExperienceAudioAsync();
      await this.setupAudioAsync();
      this.setupPromise = null;
    })();
    return this.setupPromise;
  };
}

export default new AudioManager();
