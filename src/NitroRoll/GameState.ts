import { Renderer } from "expo-three";
import { GestureResponderEvent } from "react-native";
import { Scene, Camera } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SobelOperatorShader } from "three/examples/jsm/shaders/SobelOperatorShader";

import Game from "./Game";
import { GLEvent, ResizeEvent } from "../components/GraphicsView";

class Composer extends EffectComposer {
  constructor(renderer: Renderer, scene: Scene, camera: Camera) {
    super(renderer);
    this.addPass(new RenderPass(scene, camera));

    const effectSobel = new ShaderPass(SobelOperatorShader);
    // @ts-ignore
    effectSobel.uniforms.resolution.value.x = window.innerWidth;
    // @ts-ignore
    effectSobel.uniforms.resolution.value.y = window.innerHeight;
    effectSobel.renderToScreen = true;
    this.addPass(effectSobel);
  }
}

// import Game from "../Game/Game";
export default class GameState {
  game: Game | null = null;
  renderer: Renderer | null = null;
  composer: Composer | null = null;

  onContextCreateAsync = async ({ gl, width, height, pixelRatio }: GLEvent) => {
    this.renderer = new Renderer({
      gl,
      width,
      height,
      pixelRatio,
    });

    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();
    this.composer = new Composer(
      this.renderer,
      this.game.scene!,
      this.game.camera!
    );
  };

  onTouchesBegan = (state: GestureResponderEvent) => {
    if (this.game) {
      this.game.onTouchesBegan();
    }
  };

  onResize = (layout: ResizeEvent) => {
    const { scale } = layout;
    const width = layout.width;
    const height = layout.height;

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.game) {
      if (this.game.camera) {
        this.game.camera.aspect = width / height;
        this.game.camera.updateProjectionMatrix();
      }
    }
  };

  onRender = (delta: number, time: number) => {
    if (this.game) {
      this.game.update(delta, time);
      if (this.renderer && this.game.camera) {
        this.renderer.render(this.game.scene!, this.game.camera);
      }
      if (this.composer) {
        this.composer.render(delta);
      }
    }
  };
}
