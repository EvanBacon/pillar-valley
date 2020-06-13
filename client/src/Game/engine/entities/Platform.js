import { TweenMax } from "gsap";

import { Color, Mesh, CylinderBufferGeometry, MeshPhongMaterial } from "three";
import GameObject from "../core/GameObject";
import FlatMaterial from "../utils/flatMaterial";
import randomRange from "../utils/randomRange";
import Gem from "./Gem";
import Settings from "../../../constants/Settings";
import DoubleGem from "./DoubleGem";

const radius = 33.3333333 / 2;

const pointForGem = (r, a) => ({ x: r * Math.cos(a), y: r * Math.sin(a) });

class PlatformMesh extends Mesh {
  constructor(size, material) {
    super(new CylinderBufferGeometry(size, size * 0.2, 1000, 24), material);
  }

  set y(y) {
    this.position.y = y;
  }
  get y() {
    return this.position.y;
  }

  _alpha = 1;
  get alpha() {
    return this._alpha;
  }
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

    this.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.materials) {
          child.materials.map((material) => {
            material.transparent = transparent;
            material.opacity = value;
          });
        } else if (child.material) {
          child.material.transparent = transparent;
          child.material.opacity = value;
        }
      }
    });
  }
}

const PlatformGeom = new CylinderBufferGeometry(radius, radius, 1000, 24);

class Platform extends GameObject {
  radius = 0;

  loadAsync = async (scene) => {
    const color = this.color;
    this.radius = randomRange(radius, radius * 2);
    this._platformMaterial = new MeshPhongMaterial({ color });
    this.mesh = new PlatformMesh(this.radius, this._platformMaterial);
    this.mesh.y = -500;
    this.add(this.mesh);

    await super.loadAsync(scene);
  };

  lastAngle = 0;

  updateDirection = (direction) => {
    this.playerDirection = direction;

    if (this.playerDirection === undefined) return;

    if (this.gems && this.gems.length) {
      const gemCount = this.gems.length;
      let degrees = Math.PI * 0.75;
      if (this.playerDirection) degrees *= this.playerDirection;
      const subDiv = degrees / gemCount;
      for (let i = 0; i < gemCount; i += 1) {
        const gem = this.gems[i];
        const dir = this.lastAngle + subDiv * i;
        const { x, y } = pointForGem(Settings.ballDistance, dir);
        gem.position.x = x;
        gem.position.z = y;
        gem.position.y = 0;
        gem._driftAngle = dir;
      }
    }
  };

  ensureGems = async (count) => {
    if (!this.gems) this.gems = [];

    while (this.gems.length < count) {
      let gem;
      if (count > 3 && this.gems.length === count - 1) {
        gem = new DoubleGem();
      } else {
        gem = new Gem();
      }
      gem.scale.set(0.001, 0.001, 0.001);
      this.gems.push(gem);
      await this.add(gem);
    }

    this.updateDirection(this.playerDirection);
  };

  showGems = async (count) => {
    if (count > 2) {
      await this.ensureGems(count);

      for (let i = 0; i < this.gems.length; i += 1) {
        const gem = this.gems[i];
        TweenMax.to(gem, 0.3, {
          alpha: 1,
          delay: (i + 1) * 0.1, // randomRange(0, 0.2),
          _scale: 1,
          y: 0,
          onComplete: () => (gem.canBeCollected = true),
        });
      }
    }
  };
  animateGemsOut = () => {
    if (this.gems) {
      for (let i = 0; i < this.gems.length; i += 1) {
        const gem = this.gems[i];
        const { x, y } = pointForGem(
          Settings.ballDistance * 1.5,
          gem._driftAngle
        );
        TweenMax.to(gem, 0.4, {
          alpha: 0,
          // delay: i * 0.2, //randomRange(0, 0.2),
          x,
          z: y,
        });
      }
    }
  };

  sat = 0;
  hue = 19;
  get color() {
    return new Color(`hsl(${this.hue}, ${Math.floor(this.sat)}%, 66%)`);
  }

  _animateColorTo = (s) => {
    TweenMax.to(this, 0.5, {
      sat: s,
      onUpdate: () => {
        this._platformMaterial.color = this.color;
      },
    });
  };

  becomeCurrent = () => {
    this._animateColorTo(66);
  };

  becomeTarget = () => {
    // this._animateColorTo(33);
  };

  getEndPosition = () => randomRange(-1500, -1000);

  animateOut = () => {
    this.animateGemsOut();
    TweenMax.to(this.mesh, randomRange(0.5, 0.7), {
      alpha: 0,
      delay: randomRange(0, 0.2),
      y: this.getEndPosition(),
      onComplete: () => this.destroy(),
    });
  };

  animateIn = () => {
    // this.mesh.alpha = 0;
    this.mesh.y = this.getEndPosition();
    TweenMax.to(this.mesh, randomRange(0.5, 0.7), {
      // alpha: 1,
      // delay: randomRange(0, 0.2),
      y: -500,
    });
  };
}

export default Platform;
