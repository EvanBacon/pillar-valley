import invariant from "invariant";
import React from "react";
import {
  AppState,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import uuidv4 from "uuid/v4";

import { GLView } from "expo-gl";

export default class GraphicsView extends React.Component {
  nativeRef;
  gl;

  static defaultProps = {
    arRunningProps: {},
    arCameraProps: {},
    onShouldReloadContext: Platform.OS !== "web",
    isShadowsEnabled: false,
    isPaused: false,
  };

  state = {
    appState: AppState.currentState,
    id: uuidv4(),
  };

  componentWillUnmount() {
    this.destroy();
  }

  destroy = () => {
    this.gl = null;
    this.nativeRef = null;
    cancelAnimationFrame(this.rafID);
  };
  render() {
    const { glviewStyle } = this.props;

    return (
      <GLView
        key={this.state.id}
        onLayout={this._onLayout}
        style={[styles.container, glviewStyle]}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _saveNativeRef = (ref) => {
    this.nativeRef = ref;
  };

  _onLayout = ({
    nativeEvent: {
      layout: { x, y, width, height },
    },
  }) => {
    if (!this.gl) {
      return;
    }
    if (this.props.onResize) {
      const scale = PixelRatio.get();
      this.props.onResize({ x, y, width, height, scale, pixelRatio: scale });
    }
  };

  _onContextCreate = async (gl) => {
    this.gl = gl;

    const { onContextCreate, onRender } = this.props;

    invariant(
      onRender,
      "expo-graphics: GraphicsView.onContextCreate(): `onRender` must be defined."
    );
    invariant(
      onContextCreate,
      "expo-graphics: GraphicsView.onContextCreate(): `onContextCreate` must be defined."
    );

    const scale = PixelRatio.get();
    await onContextCreate({
      gl,
      width: gl.drawingBufferWidth / scale,
      height: gl.drawingBufferHeight / scale,
      scale,
      pixelRatio: scale,
      // ...props,
    });
    let lastFrameTime;
    const render = () => {
      if (this.gl) {
        const now = 0.001 * getNow();
        const delta =
          typeof lastFrameTime !== "undefined" ? now - lastFrameTime : 0.16666;
        this.rafID = requestAnimationFrame(render);

        if (!this.props.isPaused) {
          onRender(delta);
          // NOTE: At the end of each frame, notify `Expo.GLView` with the below
          gl.endFrameEXP();
        }

        lastFrameTime = now;
      }
    };
    render();
  };
}

const getNow = global.nativePerformanceNow || Date.now;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "red",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
