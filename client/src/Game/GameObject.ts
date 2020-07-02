import * as THREE from "three";

export type BoxSize = {
  width: number;
  height: number;
  depth: number;
};

function getMaterialsForNode(node: any): THREE.Material[] {
  let materials: THREE.Material[] = [];
  if (node.materials) {
    materials = node.materials;
  } else if (Array.isArray(node.material)) {
    materials = node.material;
  } else if (node.material) {
    materials = [node.material];
  }
  return materials;
}
class GameObject extends THREE.Object3D {
  loaded = false;

  objects: GameObject[] = [];

  constructor(protected _game?: any) {
    super();
  }

  _alpha = 1;
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    this._alpha = value;
    const transparent = value !== 1;
    const materials = getMaterialsForNode(this);
    materials.map((material) => {
      material.transparent = transparent;
      material.opacity = value;
    });

    this.setAll("alpha", value);

    this.traverse((child) => {
      const materials = getMaterialsForNode(child);
      materials.map((material) => {
        material.transparent = transparent;
        material.opacity = value;
      });
    });
  }

  // get objects() {
  //   const out = [];
  //   this.traverse(function(child) {
  //     if (child instanceof GameObject) {
  //       //   out.push(child);
  //     }
  //   });
  //   return out;
  // }

  setAll = (key: string, value: any) => {
    for (const object of this.objects) {
      // @ts-ignore: TODO: FIX
      object[key] = value;
    }
  };

  reset() {
    this.visible = true;
  }

  async loadAsync(scene?: any): Promise<void> {
    this.loaded = true;
  }

  get position() {
    return this.position;
  }

  set position(value) {
    this.position.set(value);
  }

  get x(): number {
    return this.position.x;
  }
  get y(): number {
    return this.position.y;
  }
  get z(): number {
    return this.position.z;
  }
  set x(value) {
    this.position.x = value;
  }
  set y(value) {
    this.position.y = value;
  }
  set z(value) {
    this.position.z = value;
  }

  destroy = () => {
    if (this.parent) {
      if (this.parent instanceof GameObject) {
        this.parent.destroyChild(this);
      } else {
        // @ts-ignore
        this.parent.remove(this);
      }
    }
  };

  destroyChild = (object: GameObject | THREE.Object3D) => {
    if (object instanceof GameObject) {
      const index = this.objects.indexOf(object);
      if (index > -1) {
        this.objects.splice(index, 1);
      }
      this.remove(object);
    } else if (object instanceof THREE.Object3D) {
      this.remove(object);
    }
  };

  async add<T>(...props: T[]): Promise<T> {
    const object = props[0];
    if (props.length > 1) {
      for (let i = 0; i < props.length; i++) {
        await this.add(props[i]);
      }
      return this;
    }
    if (object === this) {
      throw new Error(
        "GameObject.add: object can't be added as a child of itself: " + object
      );
    }
    if (object?.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      object.parent = this;
      object.dispatchEvent({ type: "added" });

      this.children.push(object);

      if (object instanceof GameObject) {
        object.game = this.game;
        await object.loadAsync(this);
        this.objects.push(object);
        return object;
      }
    } else {
      throw new Error(
        "GameObject.add: object not an instance of THREE.Object3D: " + object
      );
    }

    return this;
  }

  remove = (...props) => {
    const object = props[0];
    if (props.length > 1) {
      for (let i = 0; i < props.length; i++) {
        this.remove(props[i]);
      }
      return this;
    }

    const index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      object.dispatchEvent({ type: "removed" });
      this.children.splice(index, 1);
    }

    const objectIndex = this.objects.indexOf(object);
    if (objectIndex !== -1) {
      object.parent = null;
      // object.dispatchEvent( { type: 'removed' } );
      this.objects.splice(objectIndex, 1);
    }

    return this;
  };

  get game(): any {
    return this._game;
  }

  set game(value: any) {
    this._game = value;
    this.setAll("game", value);
  }

  update(delta: number, time: number): void {
    if (!this.loaded) {
      return;
    }
    for (const object of this.objects) {
      object.update(delta, time);
    }
  }
}

export default GameObject;
