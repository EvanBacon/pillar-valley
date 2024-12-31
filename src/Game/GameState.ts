import { GestureResponderEvent } from "react-native";
import * as THREE from "three";

import { GLEvent, ResizeEvent } from "../components/GraphicsView";
import Game from "./Game";

type RendererProps = THREE.WebGLRendererParameters & {
  gl: WebGLRenderingContext;
  canvas?: HTMLCanvasElement;
  pixelRatio?: number;
  clearColor?: THREE.Color | string | number;
  width?: number;
  height?: number;
};
// import "@expo/browser-polyfill";

class Renderer extends THREE.WebGLRenderer {
  constructor({
    gl: context,
    canvas,
    pixelRatio = 1,
    clearColor,
    width,
    height,
    ...props
  }: RendererProps) {
    const inputCanvas = canvas || {
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientHeight: context.drawingBufferHeight,
    };
    super({
      canvas: inputCanvas,
      context,
      ...props,
    });
    this.setPixelRatio(pixelRatio);
    if (width && height) {
      this.setSize(width, height);
    }
    if (clearColor) {
      // @ts-ignore: Type 'string' is not assignable to type 'number'.ts(2345)
      this.setClearColor(clearColor);
    }
  }
}

export default class GameState {
  game: Game | null = null;
  renderer: Renderer | null = null;

  onContextCreateAsync = async ({ gl, width, height, pixelRatio }: GLEvent) => {
    this.renderer = new Renderer({
      gl,
      width,
      height,
      pixelRatio,
    });
    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();
  };

  onTouchesBegan = (_: GestureResponderEvent) => {
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
      if (this.renderer) {
        this.renderer.render(this.game.scene!, this.game.camera!);
      }
    }
  };
}
