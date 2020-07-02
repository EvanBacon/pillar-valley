import { CylinderGeometry, Mesh, MeshPhongMaterial } from "three";

import Colors from "../../constants/Colors";
import GameObject from "../GameObject";

let GemMaterial: MeshPhongMaterial = new MeshPhongMaterial({
  color: Colors.blue,
});

export default class Gem extends GameObject {
  constructor(...props: any) {
    super(...props);
    this.getValue = this.getValue.bind(this);
    this.pickup = this.pickup.bind(this);
  }

  driftAngle: number = 0;
  canBeCollected: boolean = false;

  getGemGeometry = (): CylinderGeometry => {
    const geometry = new CylinderGeometry(0.6, 1, 0.3, 7, 1);
    geometry.vertices[geometry.vertices.length - 1].y = -1;
    geometry.verticesNeedUpdate = true;
    return geometry;
  };

  getValue() {
    return 1;
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
    const mesh = new Mesh(this.getGemGeometry(), GemMaterial.clone());
    mesh.position.y = 10;

    mesh.scale.multiplyScalar(10);
    return mesh;
  }

  loadAsync = async (scene: THREE.Scene) => {
    this.add(this.gem);
    await super.loadAsync(scene);
  };

  update(delta: number, time: number) {
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
