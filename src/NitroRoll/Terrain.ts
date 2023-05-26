import Platform from "./Platform";
import Settings from "./Settings";
import GameObject from "../Game/GameObject";

const endOffset = Settings.cubesWide * Settings.cubeSize;

class Terrain extends GameObject {
  private _index: number = 0;

  get index() {
    return this._index;
  }
  set index(value) {
    if (value === this._index) {
      return;
    }
    this._index = value;
    console.log("Terrain: index", value, endOffset);
    const object = this.objects.shift();
    if (object) {
      this.objects.push(object);
      object.position.x += endOffset;
    }
  }

  loadAsync = async (scene: any) => {
    for (let i = 0; i < Settings.cubesWide; i++) {
      const square = await this.add(new Platform());
      square.x = i * Settings.cubeSize;
    }
    await super.loadAsync(scene);
  };
}
export default Terrain;
