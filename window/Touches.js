import React from "react";
import { PanResponder, View } from "react-native";

const EventTypes = {
  touchstart: "touchstart",
  touchend: "touchend",
  touchmove: "touchmove",
  touchcancel: "touchcancel"
};

export default WrappedComponent => {
  return class Touches extends React.Component {
    constructor(props) {
      super(props);
    }

    buildGestures = ({
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel
    }) =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

        onPanResponderGrant: ({ nativeEvent }, gestureState) =>
          onTouchStart({ ...nativeEvent, gestureState }),
        onPanResponderMove: ({ nativeEvent }, gestureState) =>
          onTouchMove({ ...nativeEvent, gestureState }),
        onPanResponderRelease: ({ nativeEvent }, gestureState) =>
          onTouchEnd({ ...nativeEvent, gestureState }),
        onPanResponderTerminate: ({ nativeEvent }, gestureState) =>
          onTouchCancel
            ? onTouchCancel({ ...nativeEvent, gestureState })
            : onTouchEnd({ ...nativeEvent, gestureState })
      });

    _emit = (type, props) => {
      if (window.document && window.document.emitter) {
        window.document.emitter.emit(type, props);
      }
    };

    _transformEvent = event => {
      event.preventDefault = event.preventDefault || (_ => {});
      event.stopPropagation = event.stopPropagation || (_ => {});
      return event;
    };

    componentWillMount() {
      this._panResponder = this.buildGestures({
        onTouchStart: event =>
          this._emit(EventTypes.touchstart, this._transformEvent(event)),
        onTouchMove: event =>
          this._emit(EventTypes.touchmove, this._transformEvent(event)),
        onTouchEnd: event =>
          this._emit(EventTypes.touchend, this._transformEvent(event)),
        onTouchCancel: event =>
          this._emit(EventTypes.touchcancel, this._transformEvent(event))
      });
    }

    render() {
      return (
        <View style={{ flex: 1 }} {...this._panResponder.panHandlers}>
          <WrappedComponent {...this.props} />
        </View>
      );
    }
  };
};
