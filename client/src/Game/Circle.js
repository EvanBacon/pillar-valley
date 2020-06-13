import { CircleGeometry, Mesh, MeshPhongMaterial } from "three";

class CircleMesh extends Mesh {
  constructor({ radius, color }) {
    const geometry = new CircleGeometry(radius, 32);
    const material = new MeshPhongMaterial({
      color,
      transparent: true,
      // side: DoubleSide,
    });
    super(geometry, material);
    this.mat = material;
  }
  _alpha = 1;
  set alpha(value) {
    this._alpha = value;
    const transparent = value !== 1;
    if (this.materials) {
      this.materials.map((material) => {
        material.transparent = transparent;
        material.opacity = value;
      });
    } else if (this.material) {
      this.material.transparent = transparent;
      this.material.opacity = value;
    }
  }

  get alpha() {
    return this._alpha;
  }

  explode = () => {
    // todo tween disapate animation
  };

  update = () => {};
}

export default CircleMesh;
