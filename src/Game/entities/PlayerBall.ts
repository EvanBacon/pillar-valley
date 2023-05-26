import { Power2 as Cubic, TweenMax } from "gsap";
import { Mesh, CylinderBufferGeometry, MeshPhongMaterial } from "three";

import Colors from "../../constants/Colors";
import Settings from "../../constants/Settings";
import Circle from "../Circle";
import GameObject from "../GameObject";

const radius = 26.6666667 / 2;
const PlayerBallGeom = new CylinderBufferGeometry(radius, radius, 9, 24);
const PlayerBallMaterial = new MeshPhongMaterial({
  color: Colors.gold,
});

class PlayerBall extends GameObject {
  private circle?: Circle;

  loadAsync = async (scene: any) => {
    const mesh = new Mesh(PlayerBallGeom.clone(), PlayerBallMaterial.clone());
    mesh.position.y = 4.5;
    this.add(mesh);

    const circle = new Circle({ radius: 1, color: 0xffffff });
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.5;
    this.circle = circle;
    circle.reset();
    this.add(circle);

    await super.loadAsync(scene);
  };

  hide = ({
    onComplete,
    duration = 0.7,
  }: { onComplete?: () => void; duration?: number } = {}) => {
    this.circle?.reset();
    TweenMax.to(this, duration || 0.7, {
      alpha: 0,
      onComplete,
    });
  };

  landed = (perfection: number, targetRadius: number) => {
    if (!Settings.circleEnabled || !this.circle) return;

    this.circle.visible = true;

    const duration = 0.7;

    const scale = targetRadius + targetRadius * 0.5 * perfection;

    TweenMax.to(this.circle.scale, duration, {
      x: scale,
      y: scale,
      ease: Cubic.easeOut,
    });

    TweenMax.to(this.circle, duration, {
      alpha: 0,
      ease: Cubic.easeOut,
      onComplete: () => this.circle?.reset(),
    });
  };
}

export default PlayerBall;
