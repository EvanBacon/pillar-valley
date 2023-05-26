import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { loadTextureAsync } from "expo-three";
import { Back, Expo as ExpoEase, TweenMax } from "gsap";
import { Platform } from "react-native";
import * as THREE from "three";

import GameObject from "./GameObject";
import MotionObserver from "./MotionObserver";

// bundled asset uri's become `asset://...` in production build, but expo-gl
// cannot handle them, https://github.com/expo/expo/issues/2693
// this workaround copies them to a known path files so we can use a regular
// `file://...` uri instead.
async function copyAssetToCacheAsync(
  assetModule: number,
  localFilename: string
): Promise<Asset> {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  if (Platform.OS !== "android") {
    return asset;
  }
  const localUri = `${FileSystem.cacheDirectory}asset_${localFilename}`;
  const fileInfo = await FileSystem.getInfoAsync(localUri, { size: false });
  if (!fileInfo.exists) {
    console.log(`copyAssetToCacheAsync ${asset.localUri} -> ${localUri}`);
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: localUri,
    });
  }
  asset.localUri = localUri;

  return asset;
}

class FlatMaterial extends THREE.MeshPhongMaterial {
  constructor(props: any) {
    super({
      flatShading: true,
      ...props,
    });
  }
}

async function loadMenuMaterialAsync(
  asset: any,
  color: number
): Promise<THREE.Material[]> {
  const image = new THREE.MeshBasicMaterial({
    map: await loadTextureAsync({ asset }),
  });

  const material = new FlatMaterial({ color });

  return [material, material, image, material, material, material];
}

async function makeMenuPillarAsync(asset: any, color = 0xdb7048) {
  const width = 100;
  const depth = width * 0.33;

  const materials = await loadMenuMaterialAsync(asset, color);

  const mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(100, 1000, depth, 1, 1, 1),
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
      await copyAssetToCacheAsync(
        require("../assets/images/PILLAR.png"),
        "pillar.png"
      )
    );
    titleGroup.add(pillar);

    pillar.position.y = -1100;
    TweenMax.to(pillar.position, 1.1, {
      y: -500,
      ease: Back.easeOut,
      delay: 0,
    });

    const pillarB = await makeMenuPillarAsync(
      await copyAssetToCacheAsync(
        require("../assets/images/VALLEY.png"),
        "valley.png"
      )
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
      await copyAssetToCacheAsync(
        require("../assets/images/BEGIN.png"),
        "begin.png"
      ),
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
  pillars: THREE.Mesh[] = [];

  animateHidden = (onComplete: () => void) => {
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

  updateWithCamera = (camera: THREE.Camera) => {
    this.motionObserver.updateWithCamera(camera);
  };
}
