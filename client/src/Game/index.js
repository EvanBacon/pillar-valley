// @flow
import Settings from '../constants/Settings';
import ExpoTHREE from '../universal/ExpoThree';
import Composer from './Composer';
import Game from './Game';

class Machine {
  time = 0;

  onContextCreateAsync = async ({
    gl, width, height, scale: pixelRatio,
  }) => {
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      width,
      height,
      pixelRatio,
    });

    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();

    if (Settings.isComposerEnabled) {
      this.composer = Composer(gl, this.renderer, this.game.scene, this.game.camera);
    }
  };

  onTouchesBegan = state => this.game.onTouchesBegan(state);

  onResize = (layout) => {
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
      this.game.onResize({ width, height });
    }
  };

  onRender = (delta) => {
    this.time += delta;

    this.game.update(delta, this.time);
    if (this.composer) {
      this.composer.render(delta);
    } else {
      this.renderer.render(this.game.scene, this.game.camera);
    }
  };
}

export default Machine;
