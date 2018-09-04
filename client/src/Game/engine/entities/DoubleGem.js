// @flow
import { Haptic } from 'expo';

import Colors from '../../../constants/Colors';
import Settings from '../../../constants/Settings';
import THREE from '../../../universal/THREE';
import Gem from './Gem';

export default class DoubleGem extends Gem {
  pickup() {
    super.pickup();
    if (Settings.isIos) {
      Haptic.selection();
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
