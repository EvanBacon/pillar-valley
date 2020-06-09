import * as Haptics from 'expo-haptics';

import Colors from '../../../constants/Colors';
import Settings from '../../../constants/Settings';
import * as THREE from 'three';
import Gem from './Gem';

export default class DoubleGem extends Gem {
  pickup() {
    super.pickup();
    try {
      Haptics.selection();
    } catch (error) {
      /* not supported */
    }
  }
  getValue() {
    return 2;
  }
  getMaterial() {
    global.DoubleGemMaterial =
      global.DoubleGemMaterial ||
      new THREE.MeshPhongMaterial({
        color: Colors.red,
      });
    return global.DoubleGemMaterial.clone();
  }
}
