import THREE from '../universal/THREE';

// @flow

class Circle extends THREE.Shape {
  constructor(radius) {
    super();
    this.moveTo(0, radius);
    this.quadraticCurveTo(radius, radius, radius, 0);
    this.quadraticCurveTo(radius, -radius, 0, -radius);
    this.quadraticCurveTo(-radius, -radius, -radius, 0);
    this.quadraticCurveTo(-radius, radius, 0, radius);
  }
}

class CircleMesh extends THREE.Mesh {
  constructor({ radius, color }) {
    const shape = new Circle(radius);
    const geometry = new THREE.ShapeBufferGeometry(shape);
    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      // side: THREE.DoubleSide,
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

  update = (dt) => {};
}

export default CircleMesh;
