import GameObject from "../Game/GameObject";
import Obstacles from "./Obstacles";
import Terrain from "./Terrain";
import Settings from "./Settings";
import easeInQuad from "./easeInQuad";

class Level extends GameObject {
  terrain: Terrain | null = null;
  obstacles: Obstacles | null = null;

  animation: Record<string, any> | null = null;
  time: number = 0;

  _index: number = 0;

  get index() {
    return this._index;
  }
  set index(value) {
    if (value === this._index) {
      return;
    }
    this._index = value;
    if (this.obstacles) this.obstacles.index = value;
    if (this.terrain) this.terrain.index = value;
  }

  onCollide: (() => void) | null = null;

  loadAsync = async (scene: any) => {
    this.terrain = await this.add(new Terrain());
    this.obstacles = await this.add(new Obstacles());
    this.obstacles.onCollide = () => {
      if (this.onCollide) this.onCollide();
    };
    await super.loadAsync(scene);
  };

  move = () => {
    this.animation = {
      timestamp: this.time,
      duration: Settings.moveAnimationDuration,
      current: this.x,
      target: this.x - Settings.cubeSize,
    };
  };

  update(delta: number, time: number) {
    this.time = time;
    super.update(delta, time);
    if (this.animation) {
      const { current, target, duration, timestamp } = this.animation;
      const currentTime = time - timestamp;
      if (currentTime < duration) {
        this.x = easeInQuad(currentTime, current, target, duration);
      } else {
        this.x = target;
        this.animation = null;
      }
    }
  }
}

export default Level;
