import { Renderer } from "expo-three";
import { GestureResponderEvent } from "react-native";

import { GLEvent, ResizeEvent } from "../components/GraphicsView";
import Game from "./Game";

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
