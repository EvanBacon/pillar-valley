import { Asset } from "expo-asset";
// import * as FileSystem from "expo-file-system";
import { Easing } from "react-native";
import * as THREE from "three";

import GameObject from "./GameObject";
import MotionObserver from "./MotionObserver";
import { RNAnimator } from "./utils/animator";

// bundled asset uri's become `asset://...` in production build, but expo-gl
// cannot handle them, https://github.com/expo/expo/issues/2693
// this workaround copies them to a known path files so we can use a regular
// `file://...` uri instead.
// async function copyAssetToCacheAsync(
//   assetModule: number,
//   localFilename: string
// ): Promise<Asset> {
//   const asset = Asset.fromModule(assetModule);
//   await asset.downloadAsync();
//   if (process.env.EXPO_OS !== "android") {
//     return asset;
//   }
//   const localUri = `${FileSystem.cacheDirectory}asset_${localFilename}`;
//   const fileInfo = await FileSystem.getInfoAsync(localUri, { size: false });
//   if (!fileInfo.exists) {
//     console.log(`copyAssetToCacheAsync ${asset.localUri} -> ${localUri}`);
//     await FileSystem.copyAsync({
//       from: asset.localUri!,
//       to: localUri,
//     });
//   }
//   asset.localUri = localUri;

//   return asset;
// }

class FlatMaterial extends THREE.MeshPhongMaterial {
  constructor(props: any) {
    super({
      flatShading: true,
      ...props,
    });
  }
}

// import registry from '@react-native/assets-registry/registry';

// function assetToPath(source: number): string {
//   // get the URI from the packager
//   const asset = registry.getAssetByID(source);
//   if (asset == null) {
//     throw new Error(
//       `Asset with ID "${source}" could not be found. Please check the image source or packager.`
//     );
//   }
//   return path.join(
//     __dirname,
//     process.env.NODE_ENV === 'production' ? '../../../' : '',
//     decodeURIComponent(
//       asset.httpServerLocation.replace('/assets/?unstable_path=', '')
//     ),
//     `${asset.name}.${asset.type}`
//   );
// }

// import { Asset } from 'expo-asset';
class MetroAssetTextureLoader extends THREE.Loader {
  constructor(manager?: any) {
    super(manager);
  }

  load(
    moduleId: number,
    onLoad?: (texture: THREE.Texture) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: any) => void
  ) {
    const texture = new THREE.Texture();
    const loader = new THREE.ImageLoader(this.manager);

    // Resolves the metro asset object to a URL.
    Asset.fromModule(moduleId)
      .downloadAsync()
      .then((asset) => {
        // On web, do whatever the THREE.ImageLoader does.
        if (process.env.EXPO_OS === "web") {
          loader.setCrossOrigin(this.crossOrigin);
          loader.setPath(this.path);
          loader.load(
            asset.localUri!,
            function (image) {
              texture.image = image;
              texture.needsUpdate = true;

              if (onLoad !== undefined) {
                onLoad(texture);
              }
            },
            onProgress,
            onError
          );
        } else {
          // Use a data texture
          texture.image = {
            data: asset,
            width: asset.width,
            height: asset.height,
          };
          // @ts-expect-error: Forces passing to `gl.texImage2D(...)` verbatim
          texture.isDataTexture = true;
          texture.needsUpdate = true;

          if (onLoad !== undefined) {
            onLoad(texture);
          }
        }
      })
      .catch(onError);

    return texture;
  }
}

const textureLoader = new MetroAssetTextureLoader();

async function loadMenuMaterialAsync(
  asset: any,
  color: number
): Promise<THREE.Material[]> {
  const image = new THREE.MeshBasicMaterial({
    // NOTE: This might not work on native, but Expo GL doesn't seem to load in the simulator and my cord is on the other side of the room.
    map: textureLoader.load(asset), // await loadTextureAsync({ asset }),
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
      require("../assets/images/PILLAR.png")
    );
    titleGroup.add(pillar);

    pillar.position.y = -1100;

    RNAnimator.to(
      pillar.position,
      1000 * 1.1,
      {
        y: -500,
      },
      {
        easing: Easing.out(Easing.back(1.7)),
      }
    );

    const pillarB = await makeMenuPillarAsync(
      require("../assets/images/VALLEY.png")
    );
    titleGroup.add(pillarB);

    if (pillarB.position) {
      pillarB.position.y = -1100;
      pillarB.position.x = 55;
      pillarB.position.z = 55;
      RNAnimator.to(
        pillarB.position,
        1000,
        {
          y: -530,
        },
        {
          easing: Easing.out(Easing.back(1.7)),
          delay: 100,
        }
      );
    }
    const pillarC = await makeMenuPillarAsync(
      require("../assets/images/BEGIN.png"),
      0xedcbbf
    );
    titleGroup.add(pillarC);

    pillarC.position.y = -1100;
    pillarC.position.x = 30;
    pillarC.position.z = 105;

    RNAnimator.to(
      pillarC.position,
      1000,
      {
        y: -540,
      },
      {
        easing: Easing.out(Easing.exp),
        delay: 200,
      }
    );

    this.add(titleGroup);

    this.pillars = [pillar, pillarB, pillarC];
  }
  pillars: THREE.Mesh[] = [];

  animateHidden = (onComplete: () => void) => {
    RNAnimator.to(
      this.position,
      1000,
      {
        y: -1100,
      },
      {
        easing: Easing.out(Easing.exp),
        delay: 200,
        onComplete: async () => {
          this.motionObserver.stop();
          onComplete();
        },
      }
    );
  };

  updateWithCamera = (camera: THREE.Camera) => {
    this.motionObserver.updateWithCamera(camera);
  };
}
