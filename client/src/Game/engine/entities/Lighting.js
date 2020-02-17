// @flow
import { HemisphereLight, DirectionalLight } from 'three';

import GameObject from '../core/GameObject';

class Lighting extends GameObject {
  get hemisphere() {
    return new HemisphereLight(0xaaaaaa, 0x000000, 0.9);
  }

  get shadow() {
    const light = new DirectionalLight(0xffffff, 0.9);
    light.position.set(0, 350, 350);
    return light;
  }

  async loadAsync(scene) {
    this.add(this.hemisphere);
    this.add(this.shadow);
    // return await super.loadAsync(scene);
  }
}

export default Lighting;
