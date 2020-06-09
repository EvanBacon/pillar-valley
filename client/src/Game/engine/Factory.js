import Colors from "../../constants/Colors";
import flatMaterial from "./utils/flatMaterial";

class Factory {
  materials = {};

  constructor() {
    Object.keys(Colors).map((key) => {
      this.materials[key] = flatMaterial({ color: Colors[key] });
    });
  }
}

global.factory = Factory.shared = new Factory();

export default Factory;
