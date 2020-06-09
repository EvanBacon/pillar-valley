import { TweenMax } from 'gsap';
import { Color, CylinderGeometry, Mesh, MeshPhongMaterial } from 'three';

import Colors from '../../../constants/Colors';
import GameObject from '../core/GameObject';

export default class Gem extends GameObject {
  constructor(...props) {
    super(...props);
    this.getMaterial = this.getMaterial.bind(this);
    this.getValue = this.getValue.bind(this);
    this.pickup = this.pickup.bind(this);
  }

  getGemGeometry = () => {
    const geometry = new CylinderGeometry(0.6, 1, 0.3, 7, 1);
    geometry.vertices[geometry.vertices.length - 1].y = -1;
    geometry.verticesNeedUpdate = true;
    return geometry;
  };

  getValue() {
    return 1;
  }

  getMaterial() {
    global.GemMaterial =
      global.GemMaterial ||
      new MeshPhongMaterial({
        color: Colors.blue,
      });
    return global.GemMaterial.clone();
  }

  set _scale(v) {
    this.scale.set(v, v, v);
  }
  get _scale() {
    return this.scale.y;
  }

  pickup() {
    this.destroy();
    // TODO: maybe particles??
    this.canBeCollected = false;
  }

  get gem() {
    const mesh = new Mesh(this.getGemGeometry(), this.getMaterial());
    mesh.position.y = 10;

    mesh.scale.multiplyScalar(10);
    return mesh;
  }

  loadAsync = async scene => {
    this.add(this.gem);
    await super.loadAsync(scene);
  };

  sat = 0;
  hue = 19;
  get color() {
    return new Color(`hsl(${this.hue}, ${Math.floor(this.sat)}%, 66%)`);
  }

  _animateColorTo = s => {
    TweenMax.to(this, 0.5, {
      sat: s,
      onUpdate: () => {
        this._platformMaterial.color = this.color;
      },
    });
  };

  update(delta, time) {
    this.rotation.y += 4 * delta;
    // this.rotation.x += 2 * delta;

    // this.x = Math.sin(time * this.speed) * 100;
    super.update(delta, time);
  }

  //   animateOut = () => {
  //     TweenMax.to(this, randomRange(0.5, 0.7), {
  //       alpha: 0,
  //       delay: randomRange(0, 0.2),
  //       y: this.getEndPosition(),
  //       onComplete: () => this.destroy(),
  //     });
  //   };

  //   animateIn = () => {
  //     this.alpha = 0;
  //     this.y = this.getEndPosition();
  //     TweenMax.to(this, randomRange(0.5, 0.7), {
  //       alpha: 1,
  //       // delay: randomRange(0, 0.2),
  //       y: -500,
  //     });
  //   };
}
