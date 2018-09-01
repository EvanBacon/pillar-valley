// @flow
import THREE from '../../../universal/THREE';

export default props =>
  new THREE.MeshPhongMaterial({
    flatShading: true,
    ...props,
  });
