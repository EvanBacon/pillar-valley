import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import * as THREE from "three";

import Colors from "../../../constants/Colors";
import Gem from "./Gem";

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
    global.DoubleGemMaterial =
      global.DoubleGemMaterial ||
      new THREE.MeshPhongMaterial({
        color: Colors.red,
      });
    return global.DoubleGemMaterial.clone();
  }
}
