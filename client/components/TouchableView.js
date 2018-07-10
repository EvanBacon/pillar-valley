// // @flow
// /* global Alert */

// import React from 'react';
// import { Animated, StyleSheet, View } from 'react-native';

// import { DangerZone } from 'expo';
// const { PanGestureHandler, ScrollView, State } = DangerZone.GestureHandler;

// // const USE_NATIVE_DRIVER = false;

// type NativeEvent = {
//   x: number,
//   y: number,
//   absoluteX: number,
//   absoluteY: number,
//   translationX: number,
//   translationY: number,
//   velocityX: number,
//   velocityY: number,
//   target: number,
//   handlerTag: number,
//   target: any,
//   state: number,
// };

// type GestureEvent = {
//   nativeEvent: NativeEvent,
// };

// type Props = {
//   onTouchesBegan: (event: GestureEvent) => void,
//   onTouchesMoved: (event: GestureEvent) => void,
//   onTouchesEnded: (event: GestureEvent) => void,
//   onTouchesCancelled: (event: GestureEvent) => void,
// };

// export default class TouchableView extends React.Component<Props> {
//   /*
//     0: State.UNDETERMINED - default and initial state
//     1: State.FAILED - handler failed recognition of the gesture
//     2: State.BEGAN - handler has initiated recognition but have not enough data to tell if it has recognized or not
//     3: State.CANCELLED - handler has been cancelled because of other handler (or a system) stealing the touch stream
//     4: State.ACTIVE - handler has recognized
//     5: State.END - gesture has completed
//   */

//   _onHandlerStateChange = event => {
//     // console.warn('target', event.handlerTag);
//     switch (event.nativeEvent.state) {
//       case State.BEGAN:
//         this.props.onTouchesBegan(event);
//         break;
//       case State.END:
//         this.props.onTouchesEnded(event);
//         break;
//       case State.FAILED:
//       case State.CANCELLED:
//         this.props.onTouchesCancelled(event);
//         break;
//       default:
//         break;
//     }
//   };

//   _onGestureEvent = event => {
//     if (event.nativeEvent.state === State.ACTIVE) {
//       this.props.onTouchesMoved(event);
//     }
//   };

//   render() {
//     const { children, id, ...props } = this.props;
//     return (
//       <PanGestureHandler
//         {...props}
//         onGestureEvent={this._onGestureEvent}
//         onHandlerStateChange={this._onHandlerStateChange}
//         id={`touchable-${id}`}
//       >
//         {children}
//       </PanGestureHandler>
//     );
//   }
// }

// @flow
import React from 'react';
import { PanResponder, View } from 'react-native';
import { PropTypes } from 'prop-types';

/* global Alert */

export default class TouchableView extends React.Component {
  static propTypes = {
    onTouchesBegan: PropTypes.func.isRequired,
    onTouchesMoved: PropTypes.func.isRequired,
    onTouchesEnded: PropTypes.func.isRequired,
    onTouchesCancelled: PropTypes.func.isRequired,
    onStartShouldSetPanResponderCapture: PropTypes.func.isRequired,
  };
  static defaultProps = {
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
    onStartShouldSetPanResponderCapture: () => true,
  };

  buildGestures = () =>
    PanResponder.create({
      // onResponderTerminate: this.props.onResponderTerminate ,
      // onStartShouldSetResponder: () => true,
      onResponderTerminationRequest: this.props.onResponderTerminationRequest,
      onStartShouldSetPanResponderCapture: this.props
        .onStartShouldSetPanResponderCapture,
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

  componentWillMount() {
    this._panResponder = this.buildGestures();
  }

  render() {
    const { children, id, style, ...props } = this.props;
    return (
      <View {...props} style={[style]} {...this._panResponder.panHandlers}>
        {children}
      </View>
    );
  }
}
