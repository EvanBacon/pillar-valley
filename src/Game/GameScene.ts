import { Animated, Easing } from "react-native";
import * as THREE from "three";

import randomRange from "./utils/randomRange";

export default class GameScene extends THREE.Scene {
  private hue: number = 19;
  private _hueValue = new Animated.Value(this.hue);

  private get color(): THREE.Color {
    return new THREE.Color(`hsl(${this.hue}, 88%, 66%)`);
  }

  constructor() {
    super();

    this._hueValue.addListener(({ value }) => {
      this.hue = value;
      const color = this.color;
      this.background = color;
      // @ts-ignore
      this.fog = new THREE.Fog(color, 100, 950);
    });

    this.background = this.color;
    // @ts-ignore
    this.fog = new THREE.Fog(this.color, 100, 950);
  }

  animateBackgroundColor = (input: number) => {
    const newHue = (input * randomRange(3, 20)) % 50;

    Animated.timing(this._hueValue, {
      toValue: newHue,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false, // We're animating a non-native property
    }).start();
  };
}
