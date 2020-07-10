import * as THREE from "three";

export default class GameScene extends THREE.Scene {
  private get color(): THREE.Color {
    return new THREE.Color(`hsl(20, 100%, 0%)`);
  }

  constructor() {
    super();
    this.background = this.color;
    // @ts-ignore
    this.fog = new THREE.Fog(this.color, 100, 950);
  }
}
