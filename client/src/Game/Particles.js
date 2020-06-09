import Proton from "three.proton.js";

import { TextureLoader } from "expo-three";
import { Sprite, SpriteMaterial } from "three";
import GameObject from "./engine/core/GameObject";

class Snow extends GameObject {
  proton = new Proton();
  debug = false;
  async loadAsync(...props) {
    const { scene } = this.game;
    const size = 100;
    const emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(
      new Proton.Span(34, 48),
      new Proton.Span(0.2, 0.5)
    );
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(new Proton.Span(1, 1.01)));
    const position = new Proton.Position();
    const positionZone = new Proton.BoxZone(size, size, size);
    position.addZone(positionZone);
    emitter.addInitialize(position);
    emitter.addInitialize(new Proton.Life(5, 10));

    const sprite = await this.createSprite(require("./assets/snow.png"));
    emitter.addInitialize(new Proton.Body(sprite));
    emitter.addInitialize(
      new Proton.Velocity(0, new Proton.Vector3D(0, -0.1, 0), 90)
    );
    emitter.addBehaviour(new Proton.RandomDrift(1.0, 0.1, 1.0, 0.05));
    emitter.addBehaviour(new Proton.Rotate("random", "random"));
    emitter.addBehaviour(new Proton.Gravity(0.2));
    // const screenZone = new Proton.ScreenZone(camera, renderer, size, '1234');
    // const crossZone = new Proton.CrossZone(screenZone, 'dead');
    // emitter.addBehaviour(crossZone);
    emitter.p.x = 0;
    emitter.p.y = size;
    emitter.emit();

    this.proton.addEmitter(emitter);
    this.proton.addRender(new Proton.SpriteRender(scene));
    this.emitter = emitter;

    if (this.debug) {
      Proton.Debug.drawEmitter(this.proton, scene, this.emitter);
      // Proton.Debug.drawZone(this.proton, scene, screenZone);

      // Proton.Debug.drawZone(this.proton, scene, crossZone);
      Proton.Debug.drawZone(this.proton, scene, positionZone);
    }

    return super.loadAsync(...props);
  }

  createSprite = async (resource) => {
    const material = new SpriteMaterial({
      map: new TextureLoader().load(resource),
      transparent: true,
      opacity: 0.5,
      color: 0xffffff,
    });
    this.sprite = new Sprite(material);
    return this.sprite;
  };

  update(delta, time) {
    super.update(delta, time);

    this.proton.update();
  }
}

export default Snow;
