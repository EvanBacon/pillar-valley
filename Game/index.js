import ExpoTHREE from 'expo-three';

import Composer from './Composer';
import Game from './Game';

class Machine {
  time = 0;

  onContextCreateAsync = async gl => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    this.renderer = ExpoTHREE.createRenderer({
      gl,
    });
    this.renderer.setSize(width, height);

    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();

    this.composer = Composer(
      gl,
      this.renderer,
      this.game.scene,
      this.game.camera,
    );
  };

  onTouchesBegan = state => this.game.onTouchesBegan(state);

  onResize = layout => {
    const { scale } = layout;
    const width = layout.width * scale;
    const height = layout.height * scale;
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

  onRender = delta => {
    this.time += delta;

    this.game.update(delta, this.time);
    this.composer.render(delta);
  };
}

export default Machine;
