import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { MeshPhongMaterial } from "three";

import Colors from "../../constants/Colors";
import Gem from "./Gem";

const DoubleGemMaterial = new MeshPhongMaterial({
  color: Colors.red,
});

export default class DoubleGem extends Gem {
  pickup() {
    super.pickup();
    if (Platform.OS !== "ios") return;
    try {
      Haptics.selectionAsync();
    } catch (error) {
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
