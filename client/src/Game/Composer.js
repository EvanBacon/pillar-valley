// @flow
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {VignetteShader} from 'three/examples/jsm/shaders/VignetteShader';

export default (gl, renderer, scene, camera) => {
  require('three/examples/js/postprocessing/MaskPass');
  require('three/examples/js/shaders/CopyShader');
  require('three/examples/js/shaders/HorizontalBlurShader');
  require('three/examples/js/shaders/VerticalBlurShader');
  require('three/examples/js/shaders/DotScreenShader');
  require('three/examples/js/shaders/RGBShiftShader');

  require('three/examples/js/shaders/ColorifyShader');
  require('three/examples/js/shaders/ConvolutionShader');
  require('three/examples/js/shaders/FilmShader');

  require('three/examples/js/postprocessing/DotScreenPass');
  require('three/examples/js/postprocessing/BloomPass');
  require('three/examples/js/postprocessing/FilmPass');

  const effectVignette = new ShaderPass(VignetteShader);
  effectVignette.renderToScreen = true;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(effectVignette);
  return composer;
};
