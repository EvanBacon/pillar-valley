// @flow
import THREE from '../universal/THREE';

export default (gl, renderer, scene, camera) => {
  require('three/examples/js/postprocessing/EffectComposer');
  require('three/examples/js/postprocessing/RenderPass');
  require('three/examples/js/postprocessing/ShaderPass');
  require('three/examples/js/postprocessing/MaskPass');
  require('three/examples/js/shaders/CopyShader');
  require('three/examples/js/shaders/HorizontalBlurShader');
  require('three/examples/js/shaders/VerticalBlurShader');
  require('three/examples/js/shaders/DotScreenShader');
  require('three/examples/js/shaders/RGBShiftShader');
  require('three/examples/js/shaders/VignetteShader');

  require('three/examples/js/shaders/ColorifyShader');
  require('three/examples/js/shaders/ConvolutionShader');
  require('three/examples/js/shaders/FilmShader');

  require('three/examples/js/postprocessing/DotScreenPass');
  require('three/examples/js/postprocessing/BloomPass');
  require('three/examples/js/postprocessing/FilmPass');

  const effectVignette = new THREE.ShaderPass(THREE.VignetteShader);
  effectVignette.renderToScreen = true;
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  composer.addPass(effectVignette);
  return composer;
};
