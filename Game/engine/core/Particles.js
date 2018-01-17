import { THREE } from 'expo-three';
import { TweenMax } from 'gsap';

import Factory from '../Factory';
import GameObject from './GameObject';
import randomRange from '../utils/randomRange';

class Particles extends GameObject {
  parts = [];

  loadAsync = async (parent, colors) => {
    const big = new THREE.Mesh(
      new THREE.BoxBufferGeometry(20, 20, 20, 1),
      Factory.shared.materials[colors[0]],
    );
    const small = new THREE.Mesh(
      new THREE.BoxBufferGeometry(10, 10, 10, 1),
      Factory.shared.materials[colors[1]],
    );

    this.parts = [];
    for (var i = 0; i < 5; i++) {
      const a = big.clone();
      const b = small.clone();
      this.parts.push(a);
      this.parts.push(b);
      this.add(a);
      this.add(b);
    }
    await super.loadAsync(parent);
    // this.run(true);
  };

  run = (hidden = false) => {
    const ease = Power4.easeOut;

    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];
      part.position.set(0, 0, 0);
      part.scale.set(1, 1, 1);
      part.visible = true;

      const x = randomRange(-100, 100);
      const y = randomRange(-100, 100);
      const z = randomRange(-50, 100);

      const speed = randomRange(0.5, 1);

      TweenMax.to(part.position, speed, { x, y, z, ease });

      const end = 0.01;
      TweenMax.to(part.scale, speed, {
        x: end,
        y: end,
        z: end,
        ease,
        onComplete: () => (part.visible = false),
      });
    }
  };
}

export default Particles;
