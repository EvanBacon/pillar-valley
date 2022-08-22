import { Platform } from "react-native";
import {
  Group,
  Mesh,
  TetrahedronBufferGeometry,
  MeshLambertMaterial,
} from "three";

import GameObject from "../Game/GameObject";
import randomRange from "../Game/utils/randomRange";

const count = Platform.OS === "android" ? 0 : 50;

class Stars extends GameObject {
  particles: Mesh[] = [];

  loadAsync = async (scene: any) => {
    const particles = new Group();
    this.add(particles);
    const geometry = new TetrahedronBufferGeometry(
      12,
      Math.round(randomRange(0, 2))
    );
    const material = new MeshLambertMaterial({
      color: 0xff0000,
    });

    for (let i = 0; i < count; i++) {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
      );
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      mesh.rotation.set(
        randomRange(0, Math.PI),
        randomRange(0, Math.PI),
        randomRange(0, Math.PI)
      );
      particles.add(mesh);
      this.particles.push(mesh);
    }

    this.y = 150;
    this.z = -600 * 1.1;

    await super.loadAsync(scene);
  };

  update = (delta: number, time: number) => {
    super.update(delta, time);
    this.rotation.z -= 0.01 * delta;
    this.rotation.x -= 0.05 * delta;
  };
}

export default Stars;
