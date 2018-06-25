import { THREE } from 'expo-three';
// import Factory from '../Factory';

class GameObject extends THREE.Object3D {
  _loaded = false;
  _size = { width: null, height: null, depth: null };
  objects = [];

  get size() {
    const box = new THREE.Box3().setFromObject(this);

    let size = new THREE.Vector3();
    box.getSize(size);
    const { x: width, y: height, z: depth } = size
    this._size = { width, height, depth };
    return this._size;
  }

  set loaded(value) {
    this._loaded = value;
    this._size = this.size; /// Ugh
  }
  get loaded() {
    return this._loaded;
  }

  _alpha = 1;
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    this._alpha = value;
    const transparent = value !== 1;
    if (this.materials) {
      this.materials.map(material => {
        material.transparent = transparent;
        material.opacity = value;
      });
    } else if (this.material) {
      this.material.transparent = transparent;
      this.material.opacity = value;
    }

    this.setAll('alpha', value);

    this.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if (child.materials) {
          child.materials.map(material => {
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

  // get objects() {
  //   const out = [];
  //   this.traverse(function(child) {
  //     if (child instanceof GameObject) {
  //       //   out.push(child);
  //     }
  //   });
  //   return out;
  // }

  setAll = (key, value) => {
    for (let object of this.objects) {
      object[key] = value;
    }
  };

  reset() {
    this.visible = true;
  }

  async loadAsync() {
    this.loaded = true;
  }

  get position() {
    return this.position;
  }

  set position(value) {
    this.position.set(value);
  }

  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  get z() {
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
        this.parent.remove(this);
      }
    }
  };

  destroyChild = object => {
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

  async add(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        await this.add(arguments[i]);
      }
      return this;
    }
    if (object === this) {
      console.error(
        "GameObject.add: object can't be added as a child of itself.",
        object,
      );
      return this;
    }
    if (object && object.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      object.parent = this;
      object.dispatchEvent({ type: 'added' });

      this.children.push(object);

      if (object instanceof GameObject) {
        await object.loadAsync(this);
        this.objects.push(object);
        return object;
      }
    } else {
      console.error(
        'GameObject.add: object not an instance of THREE.Object3D.',
        object,
      );
    }

    return this;
  }

  remove = object => {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
      return this;
    }

    const index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      object.dispatchEvent({ type: 'removed' });
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

  get box() {
    return new THREE.Box3().setFromObject(this);
  }
  get min() {
    return this.box.min;
  }
  get max() {
    return this.box.min;
  }
  get size() {
    const box = new THREE.Box3().setFromObject(this);
    let size = new THREE.Vector3();
    box.getSize(size);
    return size;
  }
  get width() {
    return this.size.x;
  }
  get height() {
    return this.size.y;
  }
  get depth() {
    return this.size.z;
  }

  get center() {
    return this.box.center;
  }

  update(delta, time) {
    if (!this.loaded) {
      return false;
    }
    for (let object of this.objects) {
      object.update(delta, time);
    }
  }
}

export default GameObject;
