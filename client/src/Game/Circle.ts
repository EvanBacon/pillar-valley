import { CircleGeometry, Mesh, MeshPhongMaterial, Color } from "three";

class CircleMesh extends Mesh {
  private _alpha = 1;

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

  set alpha(value) {
    this._alpha = value;
    const transparent = value !== 1;
    if (Array.isArray(this.material)) {
      this.material.map((material) => {
        material.transparent = transparent;
        material.opacity = value;
      });
    } else if (this.material) {
      this.material.transparent = transparent;
      this.material.opacity = value;
    }
  }

  reset = () => {
    this.visible = false;
    this.scale.x = 0.001;
    this.scale.y = 0.001;
    this.alpha = 0.8;
  };

  get alpha() {
    return this._alpha;
  }

  explode = () => {
    // todo tween disapate animation
  };

  update = () => {};
}

export default CircleMesh;
