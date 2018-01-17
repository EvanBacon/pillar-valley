import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';

class PlayerBall extends GameObject {
  loadAsync = async scene => {
    const radius = 26.6666667 / 2;

    global.PlayerBallGeom =
      global.PlayerBallGeom ||
      new THREE.CylinderBufferGeometry(radius, radius, 9, 24);

    const mesh = new THREE.Mesh(
      global.PlayerBallGeom.clone(),
      Factory.shared.materials.gold.clone(),
    );
    mesh.position.y = 4.5;
    this.add(mesh);
    await super.loadAsync(scene);
  };
}

export default PlayerBall;
