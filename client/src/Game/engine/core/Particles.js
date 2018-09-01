// @flow
// import { THREE } from 'expo-three';
// import { TweenMax } from 'gsap';

// import Factory from '../Factory';
// import GameObject from './GameObject';
// import randomRange from '../utils/randomRange';

// class Particles extends GameObject {
//   parts = [];

//   loadAsync = async (parent, colors) => {
//     const big = new THREE.Mesh(
//       new THREE.BoxBufferGeometry(20, 20, 20, 1),
//       Factory.shared.materials[colors[0]],
//     );
//     const small = new THREE.Mesh(
//       new THREE.BoxBufferGeometry(10, 10, 10, 1),
//       Factory.shared.materials[colors[1]],
//     );

//     this.parts = [];
//     for (var i = 0; i < 5; i++) {
//       const a = big.clone();
//       const b = small.clone();
//       this.parts.push(a);
//       this.parts.push(b);
//       this.add(a);
//       this.add(b);
//     }
//     await super.loadAsync(parent);
//     // this.run(true);
//   };

//   run = (hidden = false) => {
//     const ease = Power4.easeOut;

//     for (let i = 0; i < this.parts.length; i++) {
//       const part = this.parts[i];
//       part.position.set(0, 0, 0);
//       part.scale.set(1, 1, 1);
//       part.visible = true;

//       const x = randomRange(-100, 100);
//       const y = randomRange(-100, 100);
//       const z = randomRange(-50, 100);

//       const speed = randomRange(0.5, 1);

//       TweenMax.to(part.position, speed, { x, y, z, ease });

//       const end = 0.01;
//       TweenMax.to(part.scale, speed, {
//         x: end,
//         y: end,
//         z: end,
//         ease,
//         onComplete: () => (part.visible = false),
//       });
//     }
//   };
// }

// export default Particles;

import Proton from 'three.proton.js';
import ExpoTHREE from '../../../universal/ExpoThree';
import THREE from '../../../universal/THREE';

import GameObject from './GameObject';
import Assets from '../../../Assets';

class Snow extends GameObject {
  proton = new Proton();
  debug = false;
  async loadAsync() {
    const { camera, scene, renderer } = this.game;
    const size = 150;
    const emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(1, 2));

    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(new Proton.Span(10, 0.01)));
    const position = new Proton.Position();
    const positionZone = new Proton.BoxZone(size, size / 2, size * 3);
    position.addZone(positionZone);
    emitter.addInitialize(position);

    emitter.addInitialize(new Proton.Life(5, 10));

    const sprite = await this.createSprite(Assets.images['particle.png']);
    emitter.addInitialize(new Proton.Body(sprite));
    // emitter.addInitialize(
    //   new Proton.Velocity(0, new Proton.Vector3D(0, -0.05, -0.05), 90),
    // );

    emitter.addBehaviour(new Proton.Alpha(0, 0.3));
    emitter.addBehaviour(new Proton.RandomDrift(1.0, 0.1, 1.0, 0.05));
    // emitter.addBehaviour(new Proton.Gravity(0.1));
    emitter.addBehaviour(new Proton.Scale(2, 0.001));

    this.repulsionBehaviour = new Proton.Repulsion(new Proton.Vector3D(0, 0, 0), 0, 0);
    const zone = new Proton.BoxZone(400);
    this.crossZoneBehaviour = new Proton.CrossZone(zone, 'cross');
    emitter.addBehaviour(this.repulsionBehaviour, this.crossZoneBehaviour);

    // const screenZone = new Proton.ScreenZone(camera, renderer, size, '1234');
    // var lineZone = new Proton.ScreenZone(0, 0, 0, 100, 100, 0);
    // const crossZone = new Proton.CrossZone(screenZone, 'dead');
    // emitter.addBehaviour(crossZone);
    emitter.p.x = 0;
    // emitter.p.y = size;
    emitter.p.y = 0; // size * 0.5;

    emitter.emit();

    this.proton.addEmitter(emitter);
    this.proton.addRender(new Proton.SpriteRender(scene));
    this.emitter = emitter;

    if (this.debug) {
      Proton.Debug.drawEmitter(this.proton, scene, this.emitter);
      // Proton.Debug.drawZone(this.proton, scene, lineZone);

      // Proton.Debug.drawZone(this.proton, scene, crossZone);
      Proton.Debug.drawZone(this.proton, scene, positionZone);
    }

    return super.loadAsync(arguments);
  }

  impulse = () => {
    // if (this.impulseBehaviour) {
    //   this.emitter.removeBehaviour(this.impulseBehaviour);
    // }
    this.repulsionBehaviour.reset(new Proton.Vector3D(0, 0, 0), 10, 50);

    setTimeout(() => {
      this.repulsionBehaviour.reset(new Proton.Vector3D(0, 0, 0), 0, 0);
      // this.emitter.removeBehaviour(behaviour);
    }, 300);
    // this.impulseBehaviour = behaviour;
  };

  createSprite = async (resource) => {
    const map = await ExpoTHREE.loadAsync(resource);
    const material = new THREE.SpriteMaterial({
      map,
      transparent: true,
      opacity: 0.5,
      color: 0xffffff,
    });
    this.sprite = new THREE.Sprite(material);
    return this.sprite;
  };

  update(delta, time) {
    super.update(delta, time);

    this.proton.update();
  }
}

export default Snow;
