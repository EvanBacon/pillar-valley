import * as Analytics from "expo-firebase-analytics";
import { Expo as ExpoEase, Linear, TweenLite } from "gsap";
import * as THREE from "three";
import { DirectionalLight, HemisphereLight } from "three";

import Cuboid from "./Cuboid";
import GameScene from "./GameScene";
import Level from "./Level";
import Settings from "./Settings";
import Stars from "./Stars";
import AudioManager from "../AudioManager";
import GameObject from "../Game/GameObject";
import GameStates from "../Game/GameStates";
import randomRange from "../Game/utils/randomRange";
import { dispatch } from "../zustand/store";

class Game extends GameObject {
  state = GameStates.Playing;
  score = 0;
  taps = 0;
  direction = 1;
  camera?: THREE.PerspectiveCamera;
  private _width: number;
  private _height: number;

  gameGroup?: GameObject;
  scene?: GameScene;
  gameEnded = true;

  constructor(width: number, height: number, public renderer: THREE.Renderer) {
    super({});
    this._game = this;
    this._width = width;
    this._height = height;

    // if (Settings.isAutoStartEnabled) {
    //   this.setGameState(GameStates.Playing);
    // }
  }

  createCameraAsync = (
    width: number,
    height: number
  ): THREE.PerspectiveCamera => {
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    const spaceWidth = (Settings.cubesWide - 2) * Settings.cubeSize * 0.5;

    camera.position.set(spaceWidth, 100, 400);
    camera.lookAt(new THREE.Vector3(spaceWidth + 20, 80, 0));

    return camera;
  };

  async reset() {
    super.reset();

    dispatch.game.menu();
    AudioManager.playAsync("song", true);
    await this.loadGame();

    // this.playerObject?.reset();
    // await this.pillarGroup?.reset();
  }

  async loadAsync() {
    this.scene = new GameScene();
    // @ts-ignore: idk
    this.scene.add(this);
    this.camera = await this.createCameraAsync(this._width, this._height);

    const shadowLight = new DirectionalLight(0xffffff, 0.9);
    shadowLight.position.set(0, 30, 35);
    this.scene.add(new HemisphereLight(0xaaaaaa, 0x000000, 0.9), shadowLight);

    const types = [new Stars(this)];
    const promises = types.map((type) => this.add(type));
    await Promise.all(promises);

    if (this.state === GameStates.Menu) {
      //   await this.loadMenu();
      dispatch.game.menu();
    } else {
      dispatch.game.play();
      await this.loadGame();
    }

    await super.loadAsync(this.scene);
  }

  level: null | Level = null;
  hero: null | Cuboid = null;

  private loadLevel = async () => {
    if (this.level) {
      this.remove(this.level);
      this.level = null;
    }
    this.level = await this.add(new Level());
    this.level.onCollide = () => this.gameOver();
  };

  private loadHero = async () => {
    if (this.hero) {
      this.remove(this.hero);
    }
    this.hero = await this.add(new Cuboid());
    this.hero.onComplete = () => {
      if (this.level) this.level.index = this.index;
    };
  };

  loadGame = async () => {
    this.gameGroup = await this.add(new GameObject());
    await this.loadLevel();
    await this.loadHero();

    // this.pillarGroup = await this.gameGroup.add(new PillarGroupObject());
    // this.playerObject = await this.gameGroup.add(new PlayerGroupObject());
    // this.alpha = 1;
  };

  startGame = async () => {
    // if (this.state === GameStates.Playing) {
    //   return;
    // }
    await this.loadGame();
    // this.setGameState(GameStates.Playing);
  };

  setGameState = (state: GameStates) => {
    this.state = state;
  };

  onTouchesBegan = async () => {
    if (this.gameEnded) {
      this.gameEnded = false;

      dispatch.score.reset();
      dispatch.game.play();
    }
    // if (this.state === GameStates.Menu) {
    //   this.startGame();
    // } else {
    this.changeBall();

    // if (Math.round(randomRange(0, 3)) === 0) {
    //   this.takeScreenshot();
    // }
    // }
  };

  animateGameOver = () => {
    const duration = 0.8;
    TweenLite.to(this.scale, duration, {
      y: 0.0001,
      z: 0.0001,
      ease: ExpoEase.easeOut,
      onComplete: () => {
        this.reset();

        TweenLite.to(this.scale, duration, {
          x: 1,
          y: 1,
          z: 1,
          ease: Linear.easeNone,
        });
      },
    });
  };

  get index() {
    const index = Math.abs(Math.round(this.level!.x)) / Settings.cubeSize;
    return index;
  }

  scorePoint = () => {
    AudioManager.playAsync("pop_0" + Math.round(randomRange(0, 1)));
    dispatch.score.increment();
    this.score += 1;
  };

  changeBall = async () => {
    console.log("touch");
    if (!this.loaded || !this.level || !this.hero) {
      return;
    }
    console.log("loaded", this.hero.rotating);

    // maybe hide menu
    // if (this.score <= 1) {
    //   dispatch.game.play();
    // }

    if (!this.hero.rotating && !this.gameEnded) {
      this.scorePoint();
      this.hero.rotating = true;
      this.level.move();
    }
  };

  screenShotTaken: boolean = false;

  takeScreenshot = async () => {
    if (this.screenShotTaken || !Settings.isScreenshotEnabled) {
      return;
    }
    this.screenShotTaken = true;

    // @ts-ignore
    await dispatch.screenshot.updateAsync({
      // @ts-ignore
      ref: global.gameRef,
      width: this._width,
      height: this._height,
    });
  };

  gameOver = (animate = true) => {
    if (this.gameEnded) {
      return;
    }
    this.gameEnded = true;

    AudioManager.pauseAsync("song");
    const name = "bass_0" + Math.round(randomRange(0, 8));
    AudioManager.playAsync(name);

    this.animateGameOver();

    this.takeScreenshot();
    this.screenShotTaken = false;
    dispatch.score.reset();
    Analytics.logEvent("game_over", {
      score: this.score,
    });
    this.score = 0;
    dispatch.game.menu();
  };
}

export default Game;
