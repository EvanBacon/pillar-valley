import { TweenMax } from "gsap";
import * as THREE from "three";

import randomRange from "./engine/utils/randomRange";

export default class GameScene extends THREE.Scene {
  hue: number = 19;

  get color(): THREE.Color {
    return new THREE.Color(`hsl(${this.hue}, 88%, 66%)`);
  }

  constructor() {
    super();
    this.background = this.color;
    // @ts-ignore
    this.fog = new THREE.Fog(this.color, 100, 950);
  }

  animateBackgroundColor = (input: number) => {
    TweenMax.to(this, 2, {
      hue: (input * randomRange(3, 20)) % 50,
      onUpdate: () => {
        const color = this.color;
        this.background = color;
        // @ts-ignore
        this.fog = new THREE.Fog(color, 100, 950);
      },
    });
  };
}
