import ExpoTHREE, { THREE } from 'expo-three';

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
    super(
      geometry,
      new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide }),
    );
  }

  explode = () => {
    //todo tween disapate animation
  };

  update = dt => {};
}

export default CircleMesh;
