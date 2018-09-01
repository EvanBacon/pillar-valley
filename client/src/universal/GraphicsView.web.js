// @flow
import React from 'react';
import { StyleSheet } from 'react-native';

import { GLView } from './Expo';

const uuidv4 = require('uuid/v4');

type Layout = {
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
};

type Props = {
  arEnabled?: ?boolean,
  onShouldReloadContext?: () => boolean,
  onRender: (delta: number) => void,
  onContextCreate?: (props: *) => void,
  onResize?: (layout: Layout) => void,
  shouldIgnoreSafeGaurds?: ?boolean,
} & React.ElementProps<typeof GLView>;

export default class GraphicsView extends React.Component<Props> {
  nativeRef: ?HTMLCanvasElement;
  gl: ?any;

  state = {
    id: uuidv4(),
  };

  _renderErrorView = error => (
    <div style={styles.errorContainer}>
      <h3>{error}</h3>
    </div>
  );

  componentDidMount() {
    window.addEventListener('resize', this._onLayout);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onLayout);
    this.destroy();
  }

  destroy = () => {
    this.gl = null;
    this.nativeRef = null;
    this.arSession = null;
    cancelAnimationFrame(this.rafID);
  };

  render() {
    if (!this.props.shouldIgnoreSafeGaurds) {
      if (this.props.arEnabled) {
        const message = 'ExpoGraphics.View: AR is not enabled in web yet!';
        console.error(message);
        return this._renderErrorView(message);
      }
    }

    return (
      <GLView
        ref={ref => (this.nativeRef = ref)}
        key={this.state.id}
        style={StyleSheet.flatten([styles.container, this.props.style])}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onLayout = () => {
    if (!this.gl || !this.nativeRef) {
      return;
    }

    const {
      width, height, scale, x, y,
    } = this.nativeRef;

    console.log('resize', width, height, scale, x, y);
    if (this.props.onResize) {
      this.props.onResize({
        x,
        y,
        width,
        height,
        scale, // window.devicePixelRatio,
      });
    }
  };

  _onContextCreate = async ({ gl, ...props }) => {
    this.gl = gl;
    this.setState({ width: props.width, height: props.height });
    await this.props.onContextCreate({ gl, ...props });
    let lastFrameTime;
    const render = () => {
      if (this.gl) {
        const now = 0.001 * Date.now(); // global.nativePerformanceNow();
        const delta = typeof lastFrameTime !== 'undefined' ? now - lastFrameTime : 0.16666;
        this.rafID = requestAnimationFrame(render);

        this.props.onRender(delta);
        // NOTE: At the end of each frame, notify `Expo.GLView` with the below
        lastFrameTime = now;
      }
    };
    render();
  };
}

const styles = {
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'red',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};
