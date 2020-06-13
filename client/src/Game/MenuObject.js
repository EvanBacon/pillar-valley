import { loadTextureAsync } from "expo-three";
import { Back, Expo as ExpoEase, TweenMax } from "gsap";
import * as THREE from "three";

import GameObject from "./engine/core/GameObject";
import FlatMaterial from "./engine/utils/flatMaterial";
import MotionObserver from "./MotionObserver";

async function loadMenuMaterialAsync(asset, color) {
  const image = new THREE.MeshBasicMaterial({
    map: await loadTextureAsync({ asset }),
  });

  const material = new FlatMaterial({ color });

  return [material, material, image, material, material, material];
}

async function makeMenuPillarAsync(asset, color = 0xdb7048) {
  const radius = 33.3333333;

  const materials = await loadMenuMaterialAsync(asset, color);

  const mesh = new THREE.Mesh(
    new THREE.CubeGeometry(radius * 3, 1000, radius, 1, 1, 1),
    materials
  );
  mesh.position.y = -500;
  return mesh;
}

export default class MenuObject extends GameObject {
  motionObserver = new MotionObserver();

  async loadAsync() {
    this.motionObserver.start();
    const titleGroup = new THREE.Object3D();
    const offset = -30;
    titleGroup.position.x = offset;
    titleGroup.position.z = -200;

    const pillar = await makeMenuPillarAsync(
      require("../assets/images/PILLAR.png")
    );
    titleGroup.add(pillar);

    pillar.position.y = -1100;
    TweenMax.to(pillar.position, 1.1, {
      y: -500,
      ease: Back.easeOut,
      delay: 0,
    });

    const pillarB = await makeMenuPillarAsync(
      require("../assets/images/VALLEY.png")
    );
    titleGroup.add(pillarB);

    if (pillarB.position) {
      pillarB.position.y = -1100;
      pillarB.position.x = 55;
      pillarB.position.z = 55;
      TweenMax.to(pillarB.position, 1.0, {
        y: -530,
        ease: Back.easeOut,
        delay: 0.1,
      });
    }
    const pillarC = await makeMenuPillarAsync(
      require("../assets/images/BEGIN.png"),
      0xedcbbf
    );
    titleGroup.add(pillarC);

    pillarC.position.y = -1100;
    pillarC.position.x = 30;
    pillarC.position.z = 105;
    TweenMax.to(pillarC.position, 1.0, {
      y: -540,
      ease: ExpoEase.easeOut,
      delay: 0.2,
    });

    this.add(titleGroup);

    this.pillars = [pillar, pillarB, pillarC];
  }

  animateHidden = (onComplete) => {
    TweenMax.to(this.position, 1.0, {
      y: -1100,
      ease: ExpoEase.easeOut,
      // delay: 0.2,
      onComplete: async () => {
        this.motionObserver.stop();
        onComplete();
      },
    });
  };

  updateWithCamera = (camera) => {
    this.motionObserver.updateWithCamera(camera);
  };
}