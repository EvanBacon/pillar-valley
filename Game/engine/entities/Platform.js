import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import flatMaterial from '../utils/flatMaterial';
import randomColor from '../utils/randomColor';

class Platform extends GameObject {
  loadAsync = async scene => {
    const radius = 33.3333333;

    const color = randomColor({
      luminosity: 'dark',
      hue: '#E07C4C',
    });

    global.PlatformGeom =
      global.PlatformGeom || new THREE.BoxBufferGeometry(radius, 1000, radius);

    const mesh = new THREE.Mesh(
      global.PlatformGeom.clone(),
      flatMaterial({ color }),
    );
    this.y = -500;
    this.add(mesh);
    await super.loadAsync(scene);
  };
}

export default Platform;
