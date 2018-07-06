import Settings from '../constants/Settings';
import { DangerZone, Haptic } from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import { Back, Expo as ExpoEase, Cubic, TweenMax } from 'gsap';

import GameObject from './engine/core/GameObject';
import Group from './engine/core/Group';
import Lighting from './engine/entities/Lighting';
import Platform from './engine/entities/Platform';
import PlayerBall from './engine/entities/PlayerBall';
import flatMaterial from './engine/utils/flatMaterial';
import randomRange from './engine/utils/randomRange';
import Assets from '../Assets';

import { dispatch } from '@rematch/core';

function distance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.z - p2.z;

  return Math.sqrt(a * a + b * b);
}

class Game extends GameObject {
  state = 'menu';

  balls = [];
  targets = [];
  offset = { x: 0, z: 0 };
  taps = 0;
  hue = 19;

  constructor(width, height, renderer) {
    super();
    this.renderer = renderer;
    this._width = width;
    this._height = height;

    this.observeMotion();
  }

  observeMotion = () => {
    DangerZone.DeviceMotion.setUpdateInterval(30);
    this._subscribe();
  };

  _subscribe = () => {
    this._subscription = DangerZone.DeviceMotion.addListener(
      ({ accelerationIncludingGravity }) => {
        const _index = -4;

        this.offset = {
          x: accelerationIncludingGravity.x * _index,
          z: accelerationIncludingGravity.z * _index,
        };
      },
    );
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  createScene = () => {
    return new THREE.Scene();
  };

  createCameraAsync = async (width, height) => {
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
    camera.position.set(20, 260, 100);
    camera.lookAt(new THREE.Vector3());
    camera.ogPosition = camera.position.clone();

    return camera;
  };

  async reset() {
    super.reset();

    this.gameGroup.z = 0;
    this.gameGroup.x = 0;

    this.cachedRotationVelocity = Settings.rotationSpeed;
    this.steps = 0;
    this.direction = Math.round(randomRange(0, 1));

    this.rotationAngle = 0;
    this.mainBall = 1;

    this.balls[0].x = 0;
    this.balls[0].z = Settings.ballDistance;
    this.balls[1].x = 0;
    this.balls[1].z = 0;
    this.alpha = 1;
    this.balls[1 - this.mainBall].scale.set(1, 1, 1);
    this.balls[this.mainBall].scale.set(1, 1, 1);

    for (let target of this.targets) {
      target.destroy();
    }
    this.targets = [];
    const target = await this.targetGroup.add(new Platform());
    target.x = 0;
    target.z = this.balls[0].z;
    this.targets.push(target);

    for (let i = 0; i < Settings.visibleTargets; i++) {
      await this.addTarget();
    }
  }

  get color() {
    return new THREE.Color(`hsl(${this.hue}, 88%, 66%)`);
  }
  async loadAsync() {
    this.scene = this.createScene();
    const color = this.color;
    this.scene.background = color;
    this.scene.fog = new THREE.Fog(color, 100, 950);

    this.scene.add(this);
    this.camera = await this.createCameraAsync(this._width, this._height);

    const types = [new Lighting()];
    const promises = types.map(type => this.add(type));
    await Promise.all(promises);

    if (this.state === 'menu') {
      await this.loadMenu();
      dispatch.game.menu();
    } else {
      dispatch.game.play();
      await this.loadGame();
    }

    await super.loadAsync(this.scene);
  }

  loadMenu = async () => {
    const topMaterial = async (res, color) => {
      const image = new THREE.MeshBasicMaterial({
        map: await ExpoTHREE.loadAsync(res),
      });

      const material = flatMaterial({ color });

      return [material, material, image, material, material, material];
    };

    const makePillar = async (res, color = 0xdb7048) => {
      const radius = 33.3333333;

      const materials = await topMaterial(res, color);

      const mesh = new THREE.Mesh(
        new THREE.CubeGeometry(radius * 3, 1000, radius, 1, 1, 1),
        materials,
      );
      mesh.position.y = -500;
      return mesh;
    };

    const titleGroup = new THREE.Object3D();
    const offset = -30;
    titleGroup.position.x = offset;
    titleGroup.position.z = -200;

    const pillar = await makePillar(Assets.images['PILLAR.png']);
    titleGroup.add(pillar);

    pillar.position.y = -1100;
    TweenMax.to(pillar.position, 1.1, {
      y: -500,
      ease: Back.easeOut,
      delay: 0,
    });

    const pillarB = await makePillar(Assets.images['VALLEY.png']);
    titleGroup.add(pillarB);

    pillarB.position.y = -1100;
    pillarB.position.x = 55;
    pillarB.position.z = 55;
    TweenMax.to(pillarB.position, 1.0, {
      y: -530,
      ease: Back.easeOut,
      delay: 0.1,
    });

    const pillarC = await makePillar(Assets.images['BEGIN.png'], 0xedcbbf);
    titleGroup.add(pillarC);

    pillarC.position.y = -1100;
    pillarC.position.x = 30;
    pillarC.position.z = 105;
    TweenMax.to(pillarC.position, 1.0, {
      y: -540,
      ease: ExpoEase.easeOut,
      delay: 0.2,
    });

    const normalizer = new THREE.Object3D();
    normalizer.add(titleGroup);
    this.scene.add(normalizer);

    this.pillars = [pillar, pillarB, pillarC];
    this.titleGroup = normalizer;
  };

  loadGame = async () => {
    this.cachedRotationVelocity = Settings.rotationSpeed;
    this.steps = 0;
    this.direction = Math.round(randomRange(0, 1));
    this.gameGroup = await this.add(new Group());
    this.targetGroup = await this.gameGroup.add(new Group());
    this.ballGroup = await this.gameGroup.add(new Group());
    const ballA = await this.ballGroup.add(new PlayerBall());
    ballA.x = 0;
    ballA.z = Settings.ballDistance;
    const ballB = await this.ballGroup.add(new PlayerBall());
    ballB.x = 0;
    ballB.z = 0;
    this.balls = [ballA, ballB];
    this.alpha = 1;
    this.rotationAngle = 0;
    this.mainBall = 1;
    this.balls[1 - this.mainBall].scale.set(1, 1, 1);
    this.balls[this.mainBall].scale.set(1, 1, 1);
    const target = await this.targetGroup.add(new Platform());
    target.x = 0;
    target.z = this.balls[0].z;
    this.targets.push(target);
    for (let i = 0; i < Settings.visibleTargets; i++) {
      await this.addTarget();
    }
  };

  onTouchesBegan = async ({ pageX: x, pageY: y }) => {
    if (this.state === 'menu') {
      TweenMax.to(this.titleGroup.position, 1.0, {
        y: -1100,
        ease: ExpoEase.easeOut,
        // delay: 0.2,
        onComplete: async () => {
          await this.loadGame();
          this.state = 'game';
        },
      });
    } else {
      this.changeBall();

      if (Math.round(randomRange(0, 3)) === 0) {
        this.takeScreenshot();
      }
    }
  };

  changeBall = () => {
    this.taps += 1;
    if (this.taps % 3 === 0) {
      TweenMax.to(this, 2, {
        hue: (this.taps * randomRange(3, 20)) % 50,
        onUpdate: () => {
          const color = this.color;
          this.scene.background = color;
          this.scene.fog = new THREE.Fog(color, 100, 950);
        },
      });
      TweenMax.to(this.renderer, 1.0, {
        y: -530,
        ease: Back.easeOut,
        delay: 0.1,
      });
    }
    if (!this.loaded) {
      return;
    }

    const distanceFromTarget = distance(
      this.balls[this.mainBall].position,
      this.targets[1].position,
    );
    if (distanceFromTarget < Settings.epsilon) {
      dispatch.game.play();
      dispatch.score.increment();
      Haptic.selection();

      this.balls[this.mainBall].x = this.targets[1].x;
      this.balls[this.mainBall].z = this.targets[1].z;

      this.direction = Math.round(randomRange(0, 1));

      const target = this.targets.shift();
      const detroyTween = TweenMax.to(target, 0.7, {
        alpha: 0,
        y: -1000,
        ease: Cubic.easeIn,
        onComplete: () => target.destroy(),
      });

      this.mainBall = 1 - this.mainBall;

      this.balls[1 - this.mainBall].scale.set(1, 1, 1);
      this.balls[this.mainBall].scale.set(1, 1, 1);
      const nBallPosition = this.balls[1 - this.mainBall];
      const bBallPosition = this.balls[this.mainBall];
      const angleDeg = Math.atan2(
        bBallPosition.y - nBallPosition.y,
        bBallPosition.x - nBallPosition.x,
      );

      this.rotationAngle -= 180;

      for (let i = 0; i < this.targets.length; i++) {
        this.targets[i].alpha += 1 / 7;
      }
      this.addTarget();
    } else {
      this.gameOver();
    }
  };

  takeScreenshot = async () => {
    if (this.screenShotTaken) {
      return;
    }
    this.screenShotTaken = true;

    await dispatch.screenshot.updateAsync({
      ref: global.gameRef,
      width: this._width,
      height: this._height,
    });
  };

  gameOver = (animate = true) => {
    this.takeScreenshot();
    this.screenShotTaken = false;
    dispatch.score.reset();
    dispatch.game.menu();

    this.cachedRotationVelocity = 0;

    if (animate) {
      const gameOverTween = TweenMax.to(this.balls[this.mainBall], 0.7, {
        alpha: 0,
        onComplete: () => this.reset(),
      });

      TweenMax.to(this.balls[1 - this.mainBall], 0.4, {
        alpha: 0,
      });

      for (let target of this.targets) {
        const detroyTween = TweenMax.to(target, randomRange(0.5, 0.7), {
          alpha: 0,
          delay: randomRange(0, 0.2),
          y: randomRange(-1500, -1000),
          onComplete: () => target.destroy(),
        });
      }
    } else {
      this.reset();
    }
  };

  addTarget = async () => {
    this.steps++;
    const startX = this.targets[this.targets.length - 1].x;
    const startZ = this.targets[this.targets.length - 1].z;
    const target = await this.targetGroup.add(new Platform());
    const randomAngle = randomRange(
      Settings.angleRange[0] + 90,
      Settings.angleRange[1] + 90,
    );

    const radians = THREE.Math.degToRad(randomAngle);
    target.x = startX + Settings.ballDistance * Math.sin(radians);
    target.z = startZ + Settings.ballDistance * Math.cos(radians);
    target.alpha = 1 - this.targets.length * (1 / 7);

    this.targets.push(target);
  };

  update(delta, time) {
    const easing = 0.03;

    if (this.state === 'menu') {
      this.camera.position.z -=
        (this.offset.z + this.camera.position.z) * easing;
      this.camera.position.x -=
        (this.offset.x + this.camera.position.x) * easing;
    } else {
      this.camera.position.z = this.camera.ogPosition.z;
      this.camera.position.x = this.camera.ogPosition.x;
      if (!this.loaded) {
        return;
      }
      super.update(delta, time);

      const ballPosition = this.balls[this.mainBall].position;
      const targetPosition = this.targets[1].position;
      const distanceFromTarget = distance(ballPosition, targetPosition);

      const isFirst = this.steps <= Settings.visibleTargets;
      const minScale = this.balls[this.mainBall].scale.x <= 0.01;

      if (!isFirst) {
        if (minScale) {
          this.balls[this.mainBall].scale.set(1, 1, 1);
          this.gameOver(false);
        } else {
          const scale = Math.max(
            0.01,
            this.balls[this.mainBall].scale.x - 0.3 * delta,
          );
          this.balls[this.mainBall].scale.set(scale, 1, scale);
        }
      }

      this.rotationAngle =
        (this.rotationAngle +
          this.cachedRotationVelocity * (this.direction * 2 - 1)) %
        360;

      const radians = THREE.Math.degToRad(this.rotationAngle);

      this.balls[this.mainBall].x =
        this.balls[1 - this.mainBall].x -
        Settings.ballDistance * Math.sin(radians);
      this.balls[this.mainBall].z =
        this.balls[1 - this.mainBall].z +
        Settings.ballDistance * Math.cos(radians);

      const distanceX = this.balls[1 - this.mainBall].position.x;
      const distanceZ = this.balls[1 - this.mainBall].position.z;

      const easing = 0.03;
      this.gameGroup.z -= (distanceZ - 0 + this.gameGroup.z) * easing;
      this.gameGroup.x -= (distanceX - 0 + this.gameGroup.x) * easing;
    }
  }

  onResize = ({ width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export default Game;
