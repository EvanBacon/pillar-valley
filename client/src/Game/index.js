import Game from "./Game";

class Machine {
  time = 0;

  onContextCreateAsync = async ({ gl, width, height, scale: pixelRatio }) => {
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      width,
      height,
      pixelRatio,
    });

    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();
  };

  onTouchesBegan = (state) => this.game.onTouchesBegan(state);

  onResize = (layout) => {
    const { scale } = layout;
    const width = layout.width;
    const height = layout.height;

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    if (this.game) {
      this.game.onResize({ width, height });
    }
  };

  onRender = (delta) => {
    this.time += delta;
    this.game.update(delta, this.time);
    this.renderer.render(this.game.scene, this.game.camera);
  };
}

export default Machine;
