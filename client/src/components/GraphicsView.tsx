import invariant from "invariant";
import React from "react";
import {
  AppState,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import uuidv4 from "uuid/v4";

import { GLView, ExpoWebGLRenderingContext } from "expo-gl";

export type ResizeEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  pixelRatio: number;
};
export type GLEvent = {
  gl: ExpoWebGLRenderingContext;
  width: number;
  height: number;
  pixelRatio: number;
};

type Props = {
  onResize?: (event: ResizeEvent) => void;
  isPaused: boolean;
  onShouldReloadContext: boolean;
  onContextCreate: (glEvent: GLEvent) => void;
  onRender: (deltaTime: number) => void;
};

export default class GraphicsView extends React.Component<Props> {
  gl: ExpoWebGLRenderingContext | null = null;
  rafID?: number;

  static defaultProps = {
    onShouldReloadContext: Platform.OS !== "web",
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
    if (this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  };

  _onLayout = ({
    nativeEvent: {
      layout: { x, y, width, height },
    },
  }: LayoutChangeEvent) => {
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
    let lastFrameTime: number;
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

  render() {
    return (
      <GLView
        key={this.state.id}
        onLayout={this._onLayout}
        style={styles.container}
        onContextCreate={this._onContextCreate}
      />
    );
  }
}

const getNow = (global as any).nativePerformanceNow || Date.now;

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
