import { DeviceMotion } from "expo-sensors";
import { Dimensions, Platform } from "react-native";

import Settings from "../constants/Settings";

export default class MotionObserver {
  offset = { z: 0, x: 0 };

  _subscription;

  start = () => {
    if (!Settings.isMotionMenuEnabled) {
      return;
    }

    if (Platform.OS === "web") {
      const last = { x: 0, y: 0 };
      window.addEventListener("mousemove", ({ pageX: x, pageY: y }) => {
        const _index = -0.1;

        const { width, height } = Dimensions.get("window");
        this.offset = {
          x: (width / 2 - x) * _index,
          z: (height / 2 - y) * _index,
        };
      });
    } else {
      // TODO(Bacon): Use device motion on mobile web
      DeviceMotion.setUpdateInterval(30);

      const _index = -4;

      this._subscription = DeviceMotion.addListener(
        ({ accelerationIncludingGravity = {} }) => {
          this.offset = {
            x: accelerationIncludingGravity.x * _index,
            z: accelerationIncludingGravity.z * _index,
          };
        }
      );
    }
  };

  stop = () => {
    if (!this._subscription) return;
    this._subscription.remove();
    this._subscription = null;
  };

  updateWithCamera = (camera) => {
    const easing = 0.03;

    camera.position.z -= (this.offset.z + camera.position.z) * easing;
    camera.position.x -= (this.offset.x + camera.position.x) * easing;
  };
}
