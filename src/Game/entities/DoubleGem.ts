import * as Haptics from "expo-haptics";
import { MeshPhongMaterial } from "three";

import Gem from "./Gem";
import Colors from "../../constants/Colors";

const DoubleGemMaterial = new MeshPhongMaterial({
  color: Colors.red,
});

export default class DoubleGem extends Gem {
  pickup() {
    super.pickup();
    if (process.env.EXPO_OS !== "ios") return;
    try {
      Haptics.selectionAsync();
    } catch {
      /* not supported */
    }
  }
  getValue() {
    return 2;
  }
  getMaterial() {
    return DoubleGemMaterial.clone();
  }
}
