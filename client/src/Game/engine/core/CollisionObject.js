// @flow
import GameObject from './GameObject';

class CollisionObject extends GameObject {
  static intersectRect = (r1, r2) =>
    !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);

  static cubeIntersect = (a, b) => {
    const dist = a.position.clone().sub(b.position.clone());

    return dist.length() < a._size.width / 2;
  };
  hit = false;

  get collisionBounds() {
    const {
      position: { x, y },
    } = this;

    const width = this._size.width / 2;
    const height = this._size.height / 2;
    return {
      left: x - width,
      top: y - height,
      right: x + width,
      bottom: y + height,
    };
  }

  onCollide(id) {}

  reset() {
    super.reset();
    this.hit = false;
  }
}

CollisionObject.check = (obj1, obj2) => CollisionObject.intersectRect(obj1.collisionBounds, obj2.collisionBounds);

export default CollisionObject;
