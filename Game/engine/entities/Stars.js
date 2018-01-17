import GameObject from '../core/GameObject';
import Board from '../logic/Board';
import flatMaterial from '../utils/flatMaterial';
import randomColor from '../utils/randomColor';
import randomRange from '../utils/randomRange';

function HEXToVBColor(rrggbb) {
  if (rrggbb.startsWith('#')) {
    rrggbb = rrggbb.substr(1);
  }
  var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
  return parseInt(bbggrr, 16);
}

class Stars extends GameObject {
  particles = [];
  loadAsync = async scene => {
    const particles = new THREE.Group();
    this.add(particles);
    const geometry = new THREE.TetrahedronGeometry(3, 0);
    const geometryBall = new THREE.SphereBufferGeometry(5, 7, 7);

    for (let i = 0; i < 500; i++) {
      const color = randomColor({
        luminosity: 'bright',
      });

      const material = flatMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
      );
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      mesh.rotation.set(
        randomRange(0, Math.PI),
        randomRange(0, Math.PI),
        randomRange(0, Math.PI),
      );
      particles.add(mesh);
      this.particles.push(mesh);
    }

    this.y = 150;
    this.z = Board.shared.radius * 1.1;

    await super.loadAsync(scene);
  };

  update = (delta, time) => {
    super.update(delta, time);
    this.rotation.z -= 0.01 * delta;
    this.rotation.x -= 0.05 * delta;
  };
}

export default Stars;
