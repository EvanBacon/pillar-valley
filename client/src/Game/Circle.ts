import { CircleGeometry, Color, Mesh, MeshPhongMaterial } from "three";
import { setFullMeshAlpha } from "./GameObject";

class AlphaMesh extends Mesh {
  private _alpha: number = 1;

  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this._alpha = value;
    setFullMeshAlpha(this, value);
  }
}

class CircleMesh extends AlphaMesh {
  constructor({
    radius,
    color,
  }: {
    radius: number;
    color: number | string | Color;
  }) {
    super(
      new CircleGeometry(radius, 32),
      new MeshPhongMaterial({
        color,
        transparent: true,
        // side: DoubleSide,
      })
    );
  }

  reset = () => {
    this.visible = false;
    this.scale.x = 0.001;
    this.scale.y = 0.001;
    this.alpha = 0.8;
  };

  explode = () => {
    // todo tween disapate animation
  };

  update = () => {};
}

export default CircleMesh;
