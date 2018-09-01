// @flow
import * as Funcs from './Ease';

export default class Tween {
  constructor(props, target, params) {
    // Params
    this.initValue = { ...props }; // strip references
    this.target = target;
    this.easeFunc = Funcs[params.ease];
    this.duration = params.duration * 60;
    this.loop = params.loop || false;
    this.loopCount = params.loopCount || Infinity;
    this.pingpong = params.pingpong || false;
    // Callbacks
    this.onStart = params.onStart;
    this.onUpdate = params.onUpdate;
    this.onLoop = params.onLoop;
    this.onFinish = params.onFinish;
    // Internals
    this.result = Object.assign({}, props);
    this.isRunning = false;
    this.isFinished = false;
    this.timeIterator = 0;
    this.count = 0;

    if (params.autoStart === true) {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    if (typeof this.onStart === 'function') {
      this.onStart.call(null);
    }
  }

  stop() {
    this.reset();
    this.isFinished = true;
    this.count = 0;
    // Back the init and final values at their original state
    if (this.pingpong) {
      this.swapValues();
    }

    if (this.isFinished && typeof this.onFinish === 'function') {
      this.onFinish.call(null);
    }
  }

  reset() {
    this.isRunning = false;
    this.timeIterator = 0;
  }

  restart() {
    this.reset();
    this.start();
  }

  swapValues() {
    let ref = Object.assign({}, this.target);
    Object.assign(this.target, this.initValue);
    Object.assign(this.initValue, ref);
    ref = null;
  }

  update() {
    if (this.isRunning) {
      Object.keys(this.target).forEach((val) => {
        this.result[val] = this.easeFunc(
          this.timeIterator,
          this.initValue[val],
          this.target[val] - this.initValue[val],
          this.duration,
        );
      });

      if (typeof this.onUpdate === 'function') {
        this.onUpdate.call(null, this.result);
      }

      if (this.timeIterator === this.duration) {
        this.count++;

        if (this.loop && this.count < this.loopCount) {
          if (this.pingpong) {
            this.swapValues();
          }
          if (typeof this.onLoop === 'function') {
            this.onLoop.call(null, this.count);
          }

          this.restart();
        } else {
          this.stop();
        }
      } else {
        this.timeIterator++;
      }
    }
  }
}
