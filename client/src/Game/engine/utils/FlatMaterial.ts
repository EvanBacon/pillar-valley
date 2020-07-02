import { MeshPhongMaterial } from "three";

export default class FlatMaterial extends MeshPhongMaterial {
  constructor(props) {
    super({
      flatShading: true,
      ...props,
    });
  }
}
