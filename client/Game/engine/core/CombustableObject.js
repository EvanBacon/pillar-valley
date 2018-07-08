import BoxCollisionObject from './BoxCollisionObject';
import Particles from './Particles';

class CombustableObject extends BoxCollisionObject {
  async loadAsync(parent, colors) {
    await this.createParticlesAsync(parent, colors);
    await super.loadAsync(parent);
  }

  update(delta, time) {
    super.update(delta, time);
  }

  onCollide = id => {
    super.onCollide(id);
    this.visible = false;
    this.runParticles();
  };

  runParticles = () => {
    if (!this.particles) return;
    this.particles.position.copy(this.position);
    // this.particles.visible = true;
    this.particles.run();
  };

  createParticlesAsync = async (parent, colors) => {
    this.particles = new Particles();
    await this.particles.loadAsync(parent, colors);
    // this.particles.visible = false;
    parent.add(this.particles);
  };
}

export default CombustableObject;
