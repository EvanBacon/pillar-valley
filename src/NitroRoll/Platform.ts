import { BoxBufferGeometry, Mesh, MeshLambertMaterial } from "three";

import Settings from "./Settings";
import GameObject from "../Game/GameObject";

const materials: Record<string, any> = {
  red: new MeshLambertMaterial({
    color: 0xff0000,
  }),
  green: new MeshLambertMaterial({
    color: 0x417505,
  }),
};

const radius = Settings.cubeSize;
const geometry = new BoxBufferGeometry(radius - 0.4, 500, radius);

let platformMatIndex = 0;
class Platform extends GameObject {
  loadAsync = async (scene: any) => {
    const materialsKeys = Object.keys(materials);
    let key = materialsKeys[platformMatIndex];
    while (key === "red") {
      platformMatIndex = (platformMatIndex + 1) % materialsKeys.length;
      key = materialsKeys[platformMatIndex];
    }
    const material = materials[key]; //.clone();

    const mesh = new Mesh(geometry, material);
    this.y = -250 + radius / 2;
    this.add(mesh);
    await super.loadAsync(scene);
  };
}

export default Platform;
