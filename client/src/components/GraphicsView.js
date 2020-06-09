import invariant from "invariant";
import React from "react";
import { AppState, PixelRatio, StyleSheet, Text, View } from "react-native";
import uuidv4 from "uuid/v4";

import { GLView } from "expo-gl";

export default class GraphicsView extends React.Component {
  nativeRef;
  gl;

  static defaultProps = {
    arRunningProps: {},
    arCameraProps: {},
    isShadowsEnabled: false,
  };

  state = {
    appState: AppState.currentState,
    id: uuidv4(),
  };

  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChangeAsync);
  }

  componentWillUnmount() {
    this.destroy();
    AppState.removeEventListener("change", this.handleAppStateChangeAsync);
  }

  destroy = () => {
    this.gl = null;
    this.nativeRef = null;
    cancelAnimationFrame(this.rafID);
  };

  handleAppStateChangeAsync = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // console.log('App has come to the foreground!')
      const { onShouldReloadContext } = this.props;
      if (onShouldReloadContext && onShouldReloadContext()) {
        this.destroy();
        this.setState({ appState: nextAppState, id: uuidv4() });
        return;
      }
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    const {
      isArEnabled,
      shouldIgnoreSafeGuards,
      style,
      glviewStyle,
    } = this.props;

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

    await onContextCreate({
      gl,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      scale: PixelRatio.get(),
      // ...props,
    });
    let lastFrameTime;
    const render = () => {
      if (this.gl) {
        const now = 0.001 * getNow();
        const delta =
          typeof lastFrameTime !== "undefined" ? now - lastFrameTime : 0.16666;
        this.rafID = requestAnimationFrame(render);

        onRender(delta);
        // NOTE: At the end of each frame, notify `Expo.GLView` with the below
        gl.endFrameEXP();

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
