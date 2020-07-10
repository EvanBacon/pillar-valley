import { TweenMax } from "gsap";

import { Color, Mesh, CylinderBufferGeometry, MeshPhongMaterial } from "three";
import GameObject from "../GameObject";
import randomRange from "../utils/randomRange";
import Gem from "./Gem";
import Settings from "../../constants/Settings";
import DoubleGem from "./DoubleGem";

const radius = 33.3333333 / 2;

const pointForGem = (
  radius: number,
  angle: number
): { x: number; y: number } => ({
  x: radius * Math.cos(angle),
  y: radius * Math.sin(angle),
});

// const PlatformGeom = new CylinderBufferGeometry(size, size * 0.2, 1000, 24)

class PlatformMesh extends Mesh {
  constructor(size: number, material: THREE.Material) {
    super(new CylinderBufferGeometry(size, size * 0.2, 1000, 24), material);
  }

  set y(y: number) {
    this.position.y = y;
  }
  get y(): number {
    return this.position.y;
  }

  _alpha = 1;
  get alpha(): number {
    return this._alpha;
  }
  set alpha(value: number) {
    this._alpha = value;
    const transparent = value !== 1;

    // TODO: Maybe remove
    if (Array.isArray(this.material)) {
      this.material.map((material) => {
        material.transparent = transparent;
        material.opacity = value;
      });
    } else if (this.material) {
      this.material.transparent = transparent;
      this.material.opacity = value;
    }

    this.traverse((child) => {
      if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material.map((material) => {
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

let pillarId = 0;
function getNewPillarId() {
  return pillarId++;
}
class Platform extends GameObject {
  public pillarId: number = getNewPillarId();
  radius: number = 0;
  public gems: Gem[] = [];
  public lastAngle: number = 0;
  private playerDirection: number = 0;
  mesh?: PlatformMesh;
  private platformMaterial?: MeshPhongMaterial;

  private saturation = 0;
  private hue = 19;

  get color() {
    return new Color(`hsl(${this.hue}, ${Math.floor(this.saturation)}%, 66%)`);
  }

  loadAsync = async (scene: any) => {
    const color = this.color;
    this.radius = randomRange(radius, radius * 1.9);
    this.platformMaterial = new MeshPhongMaterial({ color });
    this.mesh = new PlatformMesh(this.radius, this.platformMaterial);
    this.mesh.y = -500;
    this.add(this.mesh);

    await super.loadAsync(scene);
  };

  public updateDirection = (direction: number) => {
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
        gem.driftAngle = dir;
      }
    }
  };

  private ensureGems = async (count: number): Promise<void> => {
    if (!this.gems) this.gems = [];

    while (this.gems.length < count) {
      let gem: Gem;
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

  public showGems = async (count: number) => {
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

  private animateGemsOut = () => {
    if (this.gems) {
      for (let i = 0; i < this.gems.length; i += 1) {
        const gem = this.gems[i];
        const { x, y } = pointForGem(
          Settings.ballDistance * 1.5,
          gem.driftAngle
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

  public becomeCurrent = () => {
    this._animateColorTo(66);
  };

  public animateOut = () => {
    this.animateGemsOut();
    if (this.mesh)
      TweenMax.to(this.mesh, randomRange(0.5, 0.7), {
        alpha: 0,
        delay: randomRange(0, 0.2),
        y: this.getEndPosition(),
        onComplete: () => this.destroy(),
      });
  };

  public animateIn = () => {
    if (!this.mesh) return;
    // this.mesh.alpha = 0;
    this.mesh.y = this.getEndPosition();
    TweenMax.to(this.mesh, randomRange(0.5, 0.7), {
      // alpha: 1,
      // delay: randomRange(0, 0.2),
      y: -500,
    });
  };
  public becomeTarget = () => {
    // this._animateColorTo(33);
  };

  private _animateColorTo = (saturation: number) => {
    TweenMax.to(this, 0.5, {
      saturation: saturation,
      onUpdate: () => {
        if (this.platformMaterial) this.platformMaterial.color = this.color;
      },
    });
  };

  private getEndPosition = (): number => randomRange(-1500, -1000);
}

export default Platform;
