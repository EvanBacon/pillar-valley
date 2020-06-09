import GameObject from './GameObject';

class BoxCollisionObject extends GameObject {
  static intersectRect = (r1, r2) =>
    !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);

  static cubeIntersect = (a, b) => {
    const dist = a.position.clone().sub(b.position.clone());

    return dist.length() < (a._size.width + b._size.width) / 2;
  };
  hit = false;

  get collisionBounds() {
    const { x, y } = this;

    const width = this._size.width * 0.667;
    const height = this._size.height * 0.667;
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

BoxCollisionObject.check = (obj1, obj2) => BoxCollisionObject.intersectRect(obj1.collisionBounds, obj2.collisionBounds);

export default BoxCollisionObject;
