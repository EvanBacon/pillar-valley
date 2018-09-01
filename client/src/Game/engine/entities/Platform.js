// @flow
import THREE from '../../../universal/THREE';

import { TweenMax } from 'gsap';

import GameObject from '../core/GameObject';
import flatMaterial from '../utils/flatMaterial';
import randomRange from '../utils/randomRange';

class Platform extends GameObject {
  loadAsync = async (scene) => {
    const radius = 33.3333333;

    const color = this.color;
    global.PlatformGeom = global.PlatformGeom || new THREE.BoxBufferGeometry(radius, 1000, radius);

    this._platformMaterial = flatMaterial({ color });
    const mesh = new THREE.Mesh(global.PlatformGeom.clone(), this._platformMaterial);
    this.y = -500;
    this.add(mesh);

    await super.loadAsync(scene);
  };

  sat = 0;
  hue = 19;
  get color() {
    return new THREE.Color(`hsl(${this.hue}, ${Math.floor(this.sat)}%, 66%)`);
  }

  _animateColorTo = (s) => {
    TweenMax.to(this, 0.5, {
      sat: s,
      onUpdate: () => {
        this._platformMaterial.color = this.color;
      },
    });
  };

  becomeCurrent = () => {
    this._animateColorTo(66);
  };

  becomeTarget = () => {
    // this._animateColorTo(33);
  };

  getEndPosition = () => randomRange(-1500, -1000);

  animateOut = () => {
    TweenMax.to(this, randomRange(0.5, 0.7), {
      alpha: 0,
      delay: randomRange(0, 0.2),
      y: this.getEndPosition(),
      onComplete: () => this.destroy(),
    });
  };

  animateIn = () => {
    this.alpha = 0;
    this.y = this.getEndPosition();
    TweenMax.to(this, randomRange(0.5, 0.7), {
      alpha: 1,
      // delay: randomRange(0, 0.2),
      y: -500,
    });
  };
}

export default Platform;
