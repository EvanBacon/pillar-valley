// @flow
import { dispatch } from "@rematch/core";
import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import { loadTextureAsync } from "expo-three";
import { Back, Expo as ExpoEase, TweenMax } from "gsap";
import { Platform as RNPlatform } from "react-native";
import * as THREE from "three";

import Settings from "../constants/Settings";
import GameObject from "./engine/core/GameObject";
import Group from "./engine/core/Group";
import Lighting from "./engine/entities/Lighting";
import Platform from "./engine/entities/Platform";
import PlayerBall from "./engine/entities/PlayerBall";
import FlatMaterial from "./engine/utils/flatMaterial";
import randomRange from "./engine/utils/randomRange";
import GameStates from "./GameStates";

function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p1.z - p2.z;

  return Math.sqrt(a * a + b * b);
}

class Game extends GameObject {
  state = GameStates.Menu;

  balls = [];
  targets = [];
  offset = { x: 0, z: 0 };
  taps = 0;
  hue = 19;

  constructor(width, height, renderer) {
    super();
    this._game = this;
    this.renderer = renderer;
    this._width = width;
    this._height = height;

    if (Settings.isAutoStartEnabled) {
      this.setGameState(GameStates.Playing);
    }

    this.observeMotion();
  }

  observeMotion = () => {
    if (!Settings.isMotionMenuEnabled) {
      return;
    }

    if (RNPlatform.OS !== "web") DeviceMotion.setUpdateInterval(30);

    this._subscribe();
  };

  _subscribe = () => {
    if (RNPlatform.OS === "web") {
      const last = { x: 0, y: 0 };
      window.addEventListener("mousemove", ({ pageX: x, pageY: y }) => {
        const _index = -0.1;

        const { width, height } = this.renderer.getSize();
        this.offset = {
          x: (width / 2 - x) * _index,
          z: (height / 2 - y) * _index,
        };
      });
    } else {
      const _index = -4;

      this._subscription = DeviceMotion.addListener(
        ({ accelerationIncludingGravity = {} }) => {
          this.offset = {
            x: accelerationIncludingGravity.x * _index,
            z: accelerationIncludingGravity.z * _index,
          };
        }
      );
    }
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  createScene = () => {
    const scene = new THREE.Scene();
    const color = this.color;
    scene.background = color;
    scene.fog = new THREE.Fog(color, 100, 950);

    scene.add(this);
    return scene;
  };

  createCameraAsync = async (width, height) => {
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
    camera.position.set(20, 260, 100);
    camera.lookAt(new THREE.Vector3());
    camera.ogPosition = camera.position.clone();

    return camera;
  };

  generateDirection = () => {
    this.direction = Math.round(randomRange(0, 1)) * 2 - 1;
  };

  async reset() {
    super.reset();

    if (this.gameGroup) {
      this.gameGroup.z = 0;
      this.gameGroup.x = 0;
    }
    this.cachedRotationVelocity = Settings.rotationSpeed;
    this.steps = 0;
    this.generateDirection();

    this.rotationAngle = 0;
    this.mainBall = 1;

    if (this.balls[0]) {
      this.balls[0].x = 0;
      this.balls[0].z = Settings.ballDistance;
    }
    if (this.balls[1]) {
      this.balls[1].x = 0;
      this.balls[1].z = 0;
    }
    this.alpha = 1;
    this.balls[1 - this.mainBall].scale.set(1, 1, 1);
    this.balls[this.mainBall].scale.set(1, 1, 1);

    for (const target of this.targets) {
      target.destroy();
    }
    this.targets = [];
    const target = await this.targetGroup.add(new Platform());
    if (target) {
      target.x = 0;
      target.z = this.balls[0].z;
      this.targets.push(target);
    }
    for (let i = 0; i < this.getVisibleTargetsCount(); i++) {
      await this.addTarget();
    }

    this.targets[0].becomeCurrent();
    this.targets[1].becomeTarget();
  }

  get color() {
    return new THREE.Color(`hsl(${this.hue}, 88%, 66%)`);
  }

  async loadAsync() {
    this.scene = this.createScene();

    this.camera = await this.createCameraAsync(this._width, this._height);

    const types = [
      new Lighting(),
      //  new Particles()
    ];
    const promises = types.map((type) => this.add(type));
    const [lighting, particles] = await Promise.all(promises);
    this.particles = particles;
    if (this.state === GameStates.Menu) {
      await this.loadMenu();
      dispatch.game.menu();
    } else {
      dispatch.game.play();
      await this.loadGame();
    }

    await super.loadAsync(this.scene);
  }

  get currentTarget() {
    return this.targets[0];
  }

  loadMenu = async () => {
    this.observeMotion();

    const topMaterial = async (res, color) => {
      const image = new THREE.MeshBasicMaterial({
        map: await loadTextureAsync({ asset: res }),
      });

      const material = new FlatMaterial({ color });

      return [material, material, image, material, material, material];
    };

    const makePillar = async (res, color = 0xdb7048) => {
      const radius = 33.3333333;

      const materials = await topMaterial(res, color);

      const mesh = new THREE.Mesh(
        new THREE.CubeGeometry(radius * 3, 1000, radius, 1, 1, 1),
        materials
      );
      mesh.position.y = -500;
      return mesh;
    };

    const titleGroup = new THREE.Object3D();
    const offset = -30;
    titleGroup.position.x = offset;
    titleGroup.position.z = -200;

    const pillar = await makePillar(require("../assets/images/PILLAR.png"));
    titleGroup.add(pillar);

    pillar.position.y = -1100;
    TweenMax.to(pillar.position, 1.1, {
      y: -500,
      ease: Back.easeOut,
      delay: 0,
    });

    const pillarB = await makePillar(require("../assets/images/VALLEY.png"));
    titleGroup.add(pillarB);

    if (pillarB.position) {
      pillarB.position.y = -1100;
      pillarB.position.x = 55;
      pillarB.position.z = 55;
      TweenMax.to(pillarB.position, 1.0, {
        y: -530,
        ease: Back.easeOut,
        delay: 0.1,
      });
    }
    const pillarC = await makePillar(
      require("../assets/images/BEGIN.png"),
      0xedcbbf
    );
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
    this.generateDirection();
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
    for (let i = 0; i < this.getVisibleTargetsCount(); i++) {
      await this.addTarget();
    }
    this.targets[0].becomeCurrent();
  };
  score = 0;

  startGame = () => {
    if (this.state === GameStates.playing) {
      return;
    }
    this._unsubscribe();
    TweenMax.to(this.titleGroup.position, 1.0, {
      y: -1100,
      ease: ExpoEase.easeOut,
      // delay: 0.2,
      onComplete: async () => {
        await this.loadGame();
        this.setGameState(GameStates.playing);
      },
    });
  };

  setGameState = (state) => {
    this.state = state;
  };

  onTouchesBegan = async ({ pageX: x, pageY: y }) => {
    if (this.state === GameStates.Menu) {
      this.startGame();
    } else {
      this.changeBall();

      if (Math.round(randomRange(0, 3)) === 0) {
        this.takeScreenshot();
      }
    }
  };

  animateBackgroundColor = (input) => {
    TweenMax.to(this, 2, {
      hue: (input * randomRange(3, 20)) % 50,
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
  };

  runHapticsWithValue = (perfection: number) => {
    if (Settings.isIos) {
      if (perfection < 0.3) {
        Haptics.impact(Haptics.ImpactFeedbackStyle.Light);
      } else if (perfection < 0.6) {
        Haptics.impact(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  };

  valueForPerfection = (perfection) => {
    return Math.floor(perfection * 6);
  };

  testCollisionWithGem = (gem) => {
    const distanceFromTarget = distance(
      this.balls[this.mainBall].position,
      gem.position
    );

    return distanceFromTarget < 20;
  };

  changeBall = async () => {
    this.taps += 1;
    if (this.taps % 3 === 0) {
      this.animateBackgroundColor(this.taps);
    }
    if (!this.loaded) {
      return;
    }

    const distanceFromTarget = distance(
      this.balls[this.mainBall].position,
      this.targets[1].position
    );

    if (distanceFromTarget < Settings.epsilon) {
      const perfection = 1 - distanceFromTarget / Settings.epsilon;
      dispatch.game.play();
      dispatch.score.increment();
      this.score += 1;
      this.runHapticsWithValue(perfection);

      if (this.particles) {
        this.particles.impulse();
      }

      this.balls[this.mainBall].x = this.targets[1].x;
      this.balls[this.mainBall].z = this.targets[1].z;

      this.generateDirection();

      const target = this.targets.shift();
      if (this.currentTarget)
        this.currentTarget.updateDirection(this.direction);

      target.animateOut();
      this.targets[0].becomeCurrent();

      if (this.score > 3) {
        this.targets[0].showGems(this.valueForPerfection(perfection));
      }
      this.targets[1].becomeTarget();

      this.balls[this.mainBall].landed(perfection);

      this.mainBall = 1 - this.mainBall;

      this.balls[1 - this.mainBall].scale.set(1, 1, 1);
      this.balls[this.mainBall].scale.set(1, 1, 1);
      this.rotationAngle -= 180;

      while (this.targets.length < this.getVisibleTargetsCount()) {
        await this.addTarget();
      }

      this.syncTargetsAlpha();
    } else {
      this.gameOver();
    }
  };

  getVisibleTargetsCount = () => {
    const level = Math.floor(this.score / 10);
    if (level < 4) {
      return Math.max(4, Settings.visibleTargets - level);
    }
    return Math.max(3, Settings.visibleTargets - (this.score % 5));
  };

  alphaForTarget = (i) => {
    const inverse = i - 1;
    const alpha = inverse / this.getVisibleTargetsCount();
    return 1 - alpha;
  };

  syncTargetsAlpha = () => {
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].alpha = this.alphaForTarget(i);
    }
  };

  takeScreenshot = async () => {
    if (this.screenShotTaken || !Settings.isScreenshotEnabled) {
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
    this.score = 0;
    dispatch.game.menu();

    this.cachedRotationVelocity = 0;

    if (animate) {
      this.balls[this.mainBall].hide({ onComplete: () => this.reset() });
      this.balls[1 - this.mainBall].hide({ duration: 0.4 });

      for (const target of this.targets) {
        target.animateOut();
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
      Settings.angleRange[1] + 90
    );

    const radians = THREE.Math.degToRad(randomAngle);
    target.x = startX + Settings.ballDistance * Math.sin(radians);
    target.z = startZ + Settings.ballDistance * Math.cos(radians);

    const last = this.targets[this.targets.length - 1];
    this.targets.push(target);
    target.lastAngle = Math.atan2(last.z - target.z, last.x - target.x);
    target.alpha = this.alphaForTarget(this.targets.length);
    target.animateIn();
  };

  update(delta, time) {
    const easing = 0.03;

    if (this.state === GameStates.Menu) {
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

      const isFirst = this.steps <= this.getVisibleTargetsCount();
      const minScale = this.balls[this.mainBall].scale.x <= 0.01;

      if (!isFirst) {
        if (minScale) {
          this.balls[this.mainBall].scale.set(1, 1, 1);
          this.gameOver(false);
        } else {
          const scale = Math.max(
            0.01,
            this.balls[this.mainBall].scale.x - 0.3 * delta
          );
          this.balls[this.mainBall].scale.set(scale, 1, scale);
        }
      }

      const speed = Math.min(
        this.cachedRotationVelocity + this.score * 0.05,
        6
      );
      this.rotationAngle = (this.rotationAngle + speed * this.direction) % 360;

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

      if (
        this.currentTarget &&
        this.currentTarget.gems &&
        this.currentTarget.gems.length
      ) {
        const collideGems = this.currentTarget.gems.filter(
          (gem) => gem.canBeCollected && gem._driftAngle !== undefined
        );
        if (collideGems.length) {
          let _ballPosition = new THREE.Vector3();
          this.balls[this.mainBall].getWorldPosition(_ballPosition);
          for (const gem of collideGems) {
            let position = new THREE.Vector3();
            gem.getWorldPosition(position);
            const angleDist = distance(_ballPosition, position);
            if (angleDist < 15) {
              gem.pickup();
              dispatch.currency.change(gem.getValue());
            }
          }
        }
      }
    }
  }

  onResize = ({ width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export default Game;
