import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import invariant from "invariant";
import React from "react";
import {
  AppState,
  LayoutChangeEvent,
  PixelRatio,
  Platform,
  StyleSheet,
} from "react-native";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

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
  onRender: (deltaTime: number, time: number) => void;
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

  time = 0;

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
    const clock = new THREE.Clock();
    const render = () => {
      if (this.gl) {
        this.rafID = requestAnimationFrame(render);

        if (!this.props.isPaused) {
          onRender(clock.getDelta(), clock.getElapsedTime());
          // NOTE: At the end of each frame, notify `Expo.GLView` with the below
          gl.endFrameEXP();
        }
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
