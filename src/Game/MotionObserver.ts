import { Subscription } from "expo-modules-core";
import { DeviceMotion } from "expo-sensors";
import { Dimensions, Platform } from "react-native";

import Settings from "../constants/Settings";

export default class MotionObserver {
  private offset = { z: 0, x: 0 };

  private _subscription: Subscription | null = null;

  public start = () => {
    if (!Settings.isMotionMenuEnabled) {
      return;
    }

    if (Platform.OS === "web") {
      window.addEventListener("mousemove", ({ pageX: x, pageY: y }) => {
        const amount = -0.1;

        const { width, height } = Dimensions.get("window");
        this.offset = {
          x: (width / 2 - x) * amount,
          z: (height / 2 - y) * amount,
        };
      });
    } else {
      // TODO(Bacon): Use device motion on mobile web
      DeviceMotion.setUpdateInterval(30);

      const amount = -4;

      this._subscription = DeviceMotion.addListener(
        ({ accelerationIncludingGravity = {} }) => {
          const x = accelerationIncludingGravity.x ?? 0;
          const z = accelerationIncludingGravity.z ?? 0;
          this.offset = {
            x: x * amount,
            z: z * amount,
          };
        }
      );
    }
  };

  public stop = () => {
    if (!this._subscription) return;
    this._subscription.remove();
    this._subscription = null;
  };

  public updateWithCamera = (camera: THREE.Camera) => {
    const easing = 0.03;

    camera.position.z -= (this.offset.z + camera.position.z) * easing;
    camera.position.x -= (this.offset.x + camera.position.x) * easing;
  };
}
