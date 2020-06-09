import { SphereBufferGeometry, Mesh } from "three";

import CombustableObject from "../core/CombustableObject";
import Factory from "../Factory";
import randomRange from "../utils/randomRange";

class Target extends CombustableObject {
  loadAsync = async (scene) => {
    global.TargetGeom = global.TargetGeom || new SphereBufferGeometry(20, 8, 8);

    const mesh = new Mesh(
      global.TargetGeom.clone(),
      Factory.shared.materials.red
    );
    this.add(mesh);
    this.z = -250;

    this.reset();
    await super.loadAsync(scene, ["red", "red"]);
  };

  reset = () => {
    super.reset();
    this.y = randomRange(150, 310);
    this.speed = randomRange(0.001, 0.005);
  };

  update(delta, time) {
    this.rotation.y += 4 * delta;
    this.rotation.x += 2 * delta;

    this.x = Math.sin(time * this.speed) * 100;
    super.update(delta, time);
  }
}

export default Target;
