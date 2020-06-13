import * as Analytics from "expo-firebase-analytics";
import * as Haptics from "expo-haptics";
import { Back, Expo as ExpoEase, TweenMax } from "gsap";
import { Platform } from "react-native";
import * as THREE from "three";

import Settings from "../constants/Settings";
import { dispatch } from "../rematch/store";
import GameObject from "./engine/core/GameObject";
import Lighting from "./engine/entities/Lighting";
import PlatformObject from "./engine/entities/Platform";
import PlayerBall from "./engine/entities/PlayerBall";
import randomRange from "./engine/utils/randomRange";
import GameStates from "./GameStates";
import MenuObject from "./MenuObject";
import MotionObserver from "./MotionObserver";

function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p1.z - p2.z;

  return Math.sqrt(a * a + b * b);
}

class PlayerGroupObject extends GameObject {
  mainBall = 1;
  /**
   * Current angle in degrees
   */
  rotationAngle = 0;

  velocity = Settings.rotationSpeed;

  async loadAsync() {
    this.balls = [new PlayerBall(), new PlayerBall()];
    await this.add(...this.balls);
    this.reset();
  }

  testCollisionWithGem = (gem) => {
    const distanceFromTarget = distance(
      this.getActiveItem().position,
      gem.position
    );

    return distanceFromTarget < 20;
  };

  landed = (accuracy) => {
    this.getActiveItem().landed(accuracy);

    this.toggleActiveItem();

    this.resetScale();
    this.rotationAngle -= 180;
  };

  toggleActiveItem = () => {
    this.mainBall = 1 - this.mainBall;
  };

  getActiveItem = () => {
    return this.balls[this.mainBall];
  };

  getStaticItem = () => {
    return this.balls[1 - this.mainBall];
  };

  getActiveItemsDistanceFromObject = (target) => {
    return distance(this.getActiveItem().position, target.position);
  };

  getStaticItemsDistanceFromObject = (target) => {
    return distance(this.getStaticItem().position, target.position);
  };

  reset = () => {
    this.velocity = Settings.rotationSpeed;
    this.rotationAngle = 0;
    this.mainBall = 1;

    for (const ball of this.balls) {
      ball.x = 0;
      ball.z = 0;
    }

    this.getStaticItem().z = Settings.ballDistance;

    this.resetScale();
  };

  resetScale = () => {
    for (const ball of this.balls) {
      ball.scale.set(1, 1, 1);
    }
  };

  playGameOverAnimation = (onComplete) => {
    this.getActiveItem().hide({ onComplete });
    this.getStaticItem().hide({ duration: 0.4 });
  };

  getActiveItemScale = () => {
    return this.getActiveItem().scale.x;
  };

  shrinkActiveItemScale = (amount) => {
    const scale = Math.max(
      Settings.minBallScale,
      this.getActiveItem().scale.x - amount
    );
    this.getActiveItem().scale.set(scale, 1, scale);
  };

  /**
   * Given a distance and angle in degrees, sets the active item's position relative to the static item's position.
   */
  moveActiveItem = (distance) => {
    const radians = THREE.Math.degToRad(this.rotationAngle);
    this.getActiveItem().x =
      this.getStaticItem().x - distance * Math.sin(radians);
    this.getActiveItem().z =
      this.getStaticItem().z + distance * Math.cos(radians);
  };

  getRotationSpeedForScore = (score) => {
    return Math.min(this.velocity + score * 0.05, Settings.maxRotationSpeed);
  };

  incrementRotationWithScoreAndDirection = (score, direction) => {
    const speed = this.getRotationSpeedForScore(score);
    this.rotationAngle = (this.rotationAngle + speed * direction) % 360;
  };
}

function getAbsolutePosition(gameObject) {
  const position = new THREE.Vector3();
  gameObject.getWorldPosition(position);
  return position;
}

class Game extends GameObject {
  state = GameStates.Menu;

  targets = [];
  taps = 0;
  hue = 19;
  motionObserver = new MotionObserver();

  constructor(width, height, renderer) {
    super();
    this._game = this;
    this.renderer = renderer;
    this._width = width;
    this._height = height;

    if (Settings.isAutoStartEnabled) {
      this.setGameState(GameStates.Playing);
    }
  }

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
    this.steps = 0;
    this.generateDirection();

    this.alpha = 1;
    this.playerObject.reset();
    for (const target of this.targets) {
      target.destroy();
    }
    this.targets = [];
    const target = await this.targetGroup.add(new PlatformObject());
    if (target) {
      target.x = 0;
      target.z = this.playerObject.getStaticItem().z;
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
    this.motionObserver.start();

    this.titleGroup = new MenuObject();
    await this.titleGroup.loadAsync();
    this.scene.add(this.titleGroup);
  };

  loadGame = async () => {
    this.steps = 0;
    this.generateDirection();
    this.gameGroup = await this.add(new GameObject());
    this.targetGroup = await this.gameGroup.add(new GameObject());
    this.playerObject = await this.gameGroup.add(new PlayerGroupObject());
    this.alpha = 1;
    const target = await this.targetGroup.add(new PlatformObject());
    target.x = 0;
    target.z = this.playerObject.getStaticItem().z;
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
    this.motionObserver.stop();

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

  runHapticsWithValue = (perfection) => {
    if (Platform.OS !== "ios") {
      return;
    }
    if (perfection < 0.3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (perfection < 0.6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  valueForAccuracy = (perfection) => {
    return Math.floor(perfection * 6);
  };

  changeBall = async () => {
    this.taps += 1;
    if (this.taps % 3 === 0) {
      this.animateBackgroundColor(this.taps);
    }
    if (!this.loaded) {
      return;
    }

    const targetPlatform = this.targets[1];
    const distanceFromTarget = this.playerObject.getActiveItemsDistanceFromObject(
      targetPlatform
    );

    if (distanceFromTarget < targetPlatform.radius) {
      const accuracy = 1 - distanceFromTarget / targetPlatform.radius;
      dispatch.game.play();
      dispatch.score.increment();
      this.score += 1;
      this.runHapticsWithValue(accuracy);

      if (this.particles) {
        this.particles.impulse();
      }

      this.generateDirection();

      const target = this.targets.shift();
      if (this.currentTarget)
        this.currentTarget.updateDirection(this.direction);

      target.animateOut();
      this.targets[0].becomeCurrent();

      if (this.score > 3) {
        this.targets[0].showGems(this.valueForAccuracy(accuracy));
      }
      this.targets[1].becomeTarget();

      this.playerObject.landed(accuracy);

      while (this.targets.length < this.getVisibleTargetsCount()) {
        await this.addTarget();
      }

      // this.syncTargetsAlpha();
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
    Analytics.logEvent("game_over", {
      score: this.score,
    });
    this.score = 0;
    dispatch.game.menu();

    // Freeze the player during the animation
    this.playerObject.velocity = 0;

    if (animate) {
      this.playerObject.playGameOverAnimation(() => this.reset());

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
    const target = await this.targetGroup.add(new PlatformObject());
    const range = 90;
    const randomAngle = randomRange(
      Settings.angleRange[0] + range,
      Settings.angleRange[1] + range
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
    if (this.state === GameStates.Menu) {
      this.motionObserver.updateWithCamera(this.camera);
    } else {
      this.camera.position.z = this.camera.ogPosition.z;
      this.camera.position.x = this.camera.ogPosition.x;
      if (!this.loaded) {
        return;
      }
      super.update(delta, time);

      if (!this.targets[1] || !this.playerObject.getActiveItem()) return;

      const isFirst = this.steps <= this.getVisibleTargetsCount();
      const minScale =
        this.playerObject.getActiveItemScale() <= Settings.minBallScale;

      if (!isFirst) {
        if (minScale) {
          this.playerObject.resetScale();
          this.gameOver(false);
        } else {
          // Currently the item shrinks at a fixed rate
          this.playerObject.shrinkActiveItemScale(0.3 * delta);
        }
      }

      // guard against race condition when targets are recycled
      if (this.targets[1]) {
        // move rotation angle
        this.playerObject.incrementRotationWithScoreAndDirection(
          this.score,
          this.direction
        );

        const ballDistance = this.playerObject.getStaticItemsDistanceFromObject(
          this.targets[1]
        );
        this.playerObject.moveActiveItem(ballDistance);
      }

      // Ease the game to the static item position to make the scene move.
      const distanceX = this.playerObject.getStaticItem().position.x;
      const distanceZ = this.playerObject.getStaticItem().position.z;

      const easing = 0.03;

      this.gameGroup.z -= (distanceZ - 0 + this.gameGroup.z) * easing;
      this.gameGroup.x -= (distanceX - 0 + this.gameGroup.x) * easing;

      // Collect gems
      if (
        this.currentTarget &&
        this.currentTarget.gems &&
        this.currentTarget.gems.length
      ) {
        const collideGems = this.currentTarget.gems.filter(
          (gem) => gem.canBeCollected && gem._driftAngle !== undefined
        );
        if (collideGems.length) {
          let _ballPosition = getAbsolutePosition(
            this.playerObject.getActiveItem()
          );
          for (const gem of collideGems) {
            let position = getAbsolutePosition(gem);
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
