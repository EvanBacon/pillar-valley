import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Colors from '../../../constants/Colors';

import Circle from '../../Circle';
import randomRange from '../utils/randomRange';

import { Back, Expo as ExpoEase, Cubic, TweenMax } from 'gsap';

class PlayerBall extends GameObject {
  loadAsync = async scene => {
    const radius = 26.6666667 / 2;

    global.PlayerBallGeom =
      global.PlayerBallGeom ||
      new THREE.CylinderBufferGeometry(radius, radius, 9, 24);

    global.PlayerBallMaterial = global.PlayerBallMaterial = new THREE.MeshPhongMaterial(
      {
        color: Colors.gold,
      },
    );
    const mesh = new THREE.Mesh(
      global.PlayerBallGeom.clone(),
      global.PlayerBallMaterial.clone(),
    );
    mesh.position.y = 4.5;
    this.add(mesh);

    const circle = new Circle({ radius: 5, color: 0xffffff });
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 10;
    this.circle = circle;
    this.resetCircle();
    this.add(circle);

    await super.loadAsync(scene);
  };

  resetCircle = () => {
    this.circle.visible = false;
    this.circle.scale.x = 0.001;
    this.circle.scale.y = 0.001;
    this.circle.alpha = 0.5;
  };

  hide = props => {
    props = props || {};

    this.resetCircle();
    TweenMax.to(this, props.duration || 0.7, {
      alpha: 0,
      ...props,
    });
  };

  landed = perfection => {
    this.circle.visible = true;

    const duration = 0.7;
    const scale = 5 + 15 * perfection; //randomRange(10, 20);

    TweenMax.to(this.circle.scale, duration, {
      x: scale,
      y: scale,
      ease: Cubic.easeOut,
    });

    TweenMax.to(this.circle, duration, {
      alpha: 0,
      ease: Cubic.easeOut,
      onComplete: this.resetCircle,
    });
  };
}

export default PlayerBall;
