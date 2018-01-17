import ExpoTHREE from 'expo-three';
import { PixelRatio } from 'react-native';

export default gl => {
  const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
  const scale = PixelRatio.get();

  const renderer = ExpoTHREE.createRenderer({
    gl,
  });
  renderer.setPixelRatio(scale);
  renderer.setSize(width, height);

  return renderer;
};
