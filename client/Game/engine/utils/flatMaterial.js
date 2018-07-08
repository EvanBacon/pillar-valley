import { THREE } from 'expo-three';

export default props =>
  new THREE.MeshPhongMaterial({
    flatShading: true,
    ...props,
  });
