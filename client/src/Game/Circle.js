import {
  Shape,
  Mesh,
  DoubleSide,
  ShapeBufferGeometry,
  MeshPhongMaterial,
} from "three";

class Circle extends Shape {
  constructor(radius) {
    super();
    this.moveTo(0, radius);
    this.quadraticCurveTo(radius, radius, radius, 0);
    this.quadraticCurveTo(radius, -radius, 0, -radius);
    this.quadraticCurveTo(-radius, -radius, -radius, 0);
    this.quadraticCurveTo(-radius, radius, 0, radius);
  }
}

class CircleMesh extends Mesh {
  constructor({ radius, color }) {
    const shape = new Circle(radius);
    const geometry = new ShapeBufferGeometry(shape);
    const mat = new MeshPhongMaterial({
      color,
      transparent: true,
      // side: DoubleSide,
    });
    super(geometry, mat);
    this.mat = mat;
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
