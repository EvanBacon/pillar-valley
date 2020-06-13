import * as Analytics from "expo-firebase-analytics";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import * as THREE from "three";

import Settings from "../constants/Settings";
import { dispatch } from "../rematch/store";
import GameObject from "./engine/core/GameObject";
import Lighting from "./engine/entities/Lighting";
import PlatformObject from "./engine/entities/Platform";
import PlayerBall from "./engine/entities/PlayerBall";
import randomRange from "./engine/utils/randomRange";
import GameScene from "./GameScene";
import GameStates from "./GameStates";
import MenuObject from "./MenuObject";

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
    return super.loadAsync();
  }

  landed = (accuracy, radius) => {
    this.getActiveItem().landed(accuracy, radius);

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
      ball.alpha = 1;
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
    const [x, z] = this.getPositionWithDistanceAndAngle(
      distance,
      this.rotationAngle
    );
    this.getActiveItem().x = x;
    this.getActiveItem().z = z;
  };

  getRotationSpeedForScore = (score) => {
    return Math.min(this.velocity + score * 0.05, Settings.maxRotationSpeed);
  };

  incrementRotationWithScoreAndDirection = (score, direction) => {
    const speed = this.getRotationSpeedForScore(score);
    this.rotationAngle = this.getRotationAngleForDirection(speed, direction);
  };

  getRotationAngleForDirection(delta, direction) {
    return (this.rotationAngle + delta * direction) % 360;
  }

  getPositionWithDistanceAndAngle(distance, angle) {
    const radians = THREE.Math.degToRad(angle);
    return [
      this.getStaticItem().x - distance * Math.sin(radians),
      this.getStaticItem().z + distance * Math.cos(radians),
    ];
  }
}

function getAbsolutePosition(gameObject) {
  const position = new THREE.Vector3();
  gameObject.getWorldPosition(position);
  return position;
}

function playHaptics(impact) {
  if (Platform.OS !== "ios") {
    return;
  }
  if (impact < 0.3) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else if (impact < 0.6) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

class PillarGroupObject extends GameObject {
  pillars = [];

  getCurrentPillar() {
    return this.pillars[0];
  }
  getNextPillar() {
    return this.pillars[1];
  }

  async getPillarAtIndexAsync(index, score) {
    // Ensure enough pillars exist
    while (this.pillars.length < index + 1) {
      await this.addPillarAsync(score);
    }
    return this.pillars[index];
  }

  getLastPillar() {
    return this.pillars[this.pillars.length - 1];
  }

  getCurrentLevelForScore(score) {
    return Math.floor(score / 10);
  }

  getVisiblePillarCount = (score = 0) => {
    const level = this.getCurrentLevelForScore(score);
    if (level < 4) {
      return Math.max(4, Settings.visiblePillars - level);
    }
    return Math.max(3, Settings.visiblePillars - (score % 5));
  };

  playGameOverAnimation = () => {
    for (const target of this.pillars) {
      target.animateOut();
    }
  };

  async loadAsync() {
    await this.reset();
    return super.loadAsync();
  }

  reset = async () => {
    for (const pillar of this.pillars) {
      pillar.destroy();
    }
    this.pillars = [];
    await this.ensureTargetsAreCreatedAsync();
    this.getCurrentPillar().becomeCurrent();
    this.getNextPillar().becomeTarget();
  };

  addPillarAsync = async (score) => {
    const lastPillar = this.getLastPillar();
    const target = await this.add(new PlatformObject());
    this.pillars.push(target);

    const distance = Settings.ballDistance; // * 0.5;
    if (!lastPillar) {
      // is the first pillar
      target.z = Settings.ballDistance;
    } else {
      // find a random location relative to the last pillar
      const startX = lastPillar.x;
      const startZ = lastPillar.z;
      const radians = this.generateRandomAngleForPillar();
      target.x = startX + distance * Math.sin(radians);
      target.z = startZ + distance * Math.cos(radians);
      target.lastAngle = Math.atan2(startZ - target.z, startX - target.x);
      // This seems to cause lag
      // target.alpha = this.alphaForTarget(this.pillars.length, score);
      target.animateIn();
    }
  };

  generateRandomAngleForPillar() {
    const range = 90;
    const randomAngle = randomRange(
      Settings.angleRange[0] + range,
      Settings.angleRange[1] + range
    );
    const radians = THREE.Math.degToRad(randomAngle);
    return radians;
  }

  alphaForTarget = (i, score) => {
    const inverse = i - 1;
    const alpha = inverse / this.getVisiblePillarCount(score);
    return 1 - alpha;
  };

  syncTargetsAlpha = (score) => {
    for (let i = 0; i < this.pillars.length; i++) {
      this.pillars[i].alpha = this.alphaForTarget(i, score);
    }
  };

  ensureTargetsAreCreatedAsync = async (score) => {
    while (this.pillars.length < this.getVisiblePillarCount(score)) {
      await this.addPillarAsync(score);
    }
  };

  getLandedPillarIndex = (playerObject) => {
    // End before 0 to skip the current pillar that the player is standing on.
    // Go in reverse order to ensure the player gets optimal skipping
    for (let index = this.pillars.length - 1; index > 0; index--) {
      const targetPlatform = this.pillars[index];
      const distanceFromTarget = playerObject.getActiveItemsDistanceFromObject(
        targetPlatform
      );

      if (distanceFromTarget < targetPlatform.radius)
        return [index, distanceFromTarget];
    }

    return null;
  };
}

class Game extends GameObject {
  state = GameStates.Menu;
  score = 0;
  taps = 0;
  direction = 1;

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

  createCameraAsync = async (width, height) => {
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
    camera.position.set(20, 260, 100);
    camera.lookAt(new THREE.Vector3());
    camera.ogPosition = camera.position.clone();

    return camera;
  };

  /**
   * Ensure the direction the play spins is the shortest route between pillars.
   */
  generateDirection = (targetPosition) => {
    // Get the distance between the player and the next pillar
    const ballDistance = distance(
      this.playerObject.getStaticItem().position,
      targetPosition
    );

    // Measure the distance between the player if it moved
    const pos1 = this.playerObject.getPositionWithDistanceAndAngle(
      ballDistance,
      this.playerObject.getRotationAngleForDirection(1, 1)
    );
    // Measure the distance between the player if it didn't move
    const pos2 = this.playerObject.getPositionWithDistanceAndAngle(
      ballDistance,
      this.playerObject.rotationAngle
    );

    // Calculate the distances
    const delta1 = distance({ x: pos1[0], z: pos1[1] }, targetPosition);
    const delta2 = distance({ x: pos2[0], z: pos2[1] }, targetPosition);
    // If moving the player +1 is shorter then keep it
    if (delta1 > delta2) {
      this.direction = 1;
    } else {
      this.direction = -1;
    }
  };

  async reset() {
    super.reset();

    if (this.gameGroup) {
      this.gameGroup.z = 0;
      this.gameGroup.x = 0;
    }

    this.playerObject.reset();
    await this.pillarGroup.reset();
  }

  async loadAsync() {
    this.scene = new GameScene();
    this.scene.add(this);
    this.camera = await this.createCameraAsync(this._width, this._height);

    const types = [
      new Lighting(),
      //  new Particles()
    ];
    const promises = types.map((type) => this.add(type));
    const [, particles] = await Promise.all(promises);
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

  loadMenu = async () => {
    this.titleGroup = await this.add(new MenuObject());
  };

  loadGame = async () => {
    this.gameGroup = await this.add(new GameObject());
    this.pillarGroup = await this.gameGroup.add(new PillarGroupObject());
    this.playerObject = await this.gameGroup.add(new PlayerGroupObject());
    this.alpha = 1;
  };

  startGame = () => {
    if (this.state === GameStates.playing) {
      return;
    }
    this.titleGroup.animateHidden(async () => {
      await this.loadGame();
      this.setGameState(GameStates.playing);
    });
  };

  setGameState = (state) => {
    this.state = state;
  };

  onTouchesBegan = async () => {
    if (this.state === GameStates.Menu) {
      this.startGame();
    } else {
      this.changeBall();

      // if (Math.round(randomRange(0, 3)) === 0) {
      //   this.takeScreenshot();
      // }
    }
  };

  changeBall = async () => {
    // postpone to prevent lag during interactions
    setTimeout(() => {
      this.taps += 1;
      // Every three taps, change the background color
      if (this.taps % 3 === 0) {
        this.scene.animateBackgroundColor(this.taps);
      }
    }, 0);

    if (!this.loaded) {
      return;
    }

    const landedPillarInfo = this.pillarGroup.getLandedPillarIndex(
      this.playerObject
    );
    if (landedPillarInfo == null) {
      // Missed the pillars
      this.gameOver();
      return;
    }
    const [pillarIndex, distanceFromTarget] = landedPillarInfo;
    const targetPlatform = this.pillarGroup.pillars[pillarIndex];
    const landedPillarRadius = targetPlatform.radius;

    const accuracy = 1 - distanceFromTarget / landedPillarRadius;

    // maybe hide menu
    if (this.score <= 1) {
      dispatch.game.play();
    }
    // Score for every pillar traversed
    for (let i = pillarIndex; i > 0; i--) {
      dispatch.score.increment();
      this.score += 1;
    }

    playHaptics(accuracy);

    // if (this.particles) {
    //   this.particles.impulse();
    // }

    const nextPillar = await this.pillarGroup.getPillarAtIndexAsync(
      pillarIndex + 1,
      this.score
    );
    this.generateDirection(nextPillar.position);

    targetPlatform.updateDirection(this.direction);

    // Animate out all of the skipped pillars
    while (
      this.pillarGroup.pillars.length &&
      this.pillarGroup.pillars[0].pillarId !== targetPlatform.pillarId
    ) {
      const previousPillar = this.pillarGroup.pillars.shift();
      previousPillar.animateOut();
    }

    targetPlatform.becomeCurrent();

    if (Settings.gemsEnabled && this.score > 3) {
      const gemCount = Math.floor(accuracy * 6);
      targetPlatform.showGems(gemCount);
    }
    nextPillar.becomeTarget();

    this.playerObject.landed(accuracy, landedPillarRadius);

    await this.pillarGroup.ensureTargetsAreCreatedAsync(this.score);

    // this.pillarGroup.syncTargetsAlpha(this.score);
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
      this.pillarGroup.playGameOverAnimation();
    } else {
      this.reset();
    }
  };

  update(delta, time) {
    if (this.state === GameStates.Menu) {
      this.titleGroup.updateWithCamera(this.camera);
    } else {
      this.camera.position.z = this.camera.ogPosition.z;
      this.camera.position.x = this.camera.ogPosition.x;
      if (!this.loaded) {
        return;
      }
      super.update(delta, time);

      if (!this.playerObject.getActiveItem()) return;

      const isFirst = this.score === 0;
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

      // guard against race condition when pillars are recycled
      if (this.pillarGroup.getNextPillar()) {
        // move rotation angle
        this.playerObject.incrementRotationWithScoreAndDirection(
          this.score,
          this.direction
        );

        const ballDistance = this.playerObject.getStaticItemsDistanceFromObject(
          this.pillarGroup.getNextPillar()
        );
        this.playerObject.moveActiveItem(ballDistance);
      }

      // Ease the game to the static item position to make the scene move.
      const distanceX = this.playerObject.getStaticItem().position.x;
      const distanceZ = this.playerObject.getStaticItem().position.z;

      const easing = 0.03;

      this.gameGroup.z -= (distanceZ - 0 + this.gameGroup.z) * easing;
      this.gameGroup.x -= (distanceX - 0 + this.gameGroup.x) * easing;

      const currentPillar = this.pillarGroup.getCurrentPillar();
      // Collect gems
      if (
        Settings.gemsEnabled &&
        currentPillar &&
        currentPillar.gems &&
        currentPillar.gems.length
      ) {
        const collideGems = currentPillar.gems.filter(
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
}

export default Game;
