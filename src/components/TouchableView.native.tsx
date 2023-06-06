/* global Alert */
import React from "react";
import { PanResponder, View } from "react-native";

export default class TouchableView extends React.Component {
  static defaultProps = {
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
    onStartShouldSetPanResponderCapture: () => true,
  };

  constructor(props) {
    super(props);
    this._panResponder = this.buildGestures();
  }

  buildGestures = () =>
    PanResponder.create({
      // onResponderTerminate: this.props.onResponderTerminate ,
      // onStartShouldSetResponder: () => true,
      onResponderTerminationRequest: this.props.onResponderTerminationRequest,
      onStartShouldSetPanResponderCapture:
        this.props.onStartShouldSetPanResponderCapture,
      // onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: ({ nativeEvent }, gestureState) =>
        this.props.onTouchesBegan({ ...nativeEvent, gestureState }),
      onPanResponderMove: ({ nativeEvent }, gestureState) =>
        this.props.onTouchesMoved({ ...nativeEvent, gestureState }),
      onPanResponderRelease: ({ nativeEvent }, gestureState) =>
        this.props.onTouchesEnded({ ...nativeEvent, gestureState }),
      onPanResponderTerminate: ({ nativeEvent }, gestureState) =>
        this.props.onTouchesCancelled
          ? this.props.onTouchesCancelled({ ...nativeEvent, gestureState })
          : this.props.onTouchesEnded({ ...nativeEvent, gestureState }),
    });

  render() {
    const { children, id, ...props } = this.props;
    return (
      <View {...props} {...this._panResponder.panHandlers}>
        {children}
      </View>
    );
  }
}
