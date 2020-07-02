import { CircleGeometry, Color, Mesh, MeshPhongMaterial } from "three";

class AlphaMesh extends Mesh {
  private _alpha: number = 1;

  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this._alpha = value;
    this.setAlpha(value);
  }

  private setAlpha(value: number) {
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
