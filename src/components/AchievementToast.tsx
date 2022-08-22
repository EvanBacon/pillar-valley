
import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

export const DURATION = {
  LENGTH_SHORT: 500,
  FOREVER: 0,
};

const { height, width } = Dimensions.get('window');

export default class Toast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      text: '',
      opacityValue: new Animated.Value(this.props.opacity),
    };
  }

  showAchievementToastWithOptions = ({
    title, subtitle, duration, callback,
  }) => {
    this.duration = typeof duration === 'number' ? duration : DURATION.LENGTH_SHORT;
    this.callback = callback;
    this.setState({
      isShow: true,
      text: title,
    });

    Animated.timing(this.state.opacityValue, {
      toValue: this.props.opacity,
      duration: this.props.fadeInDuration,
    }).start(() => {
      this.isShow = true;
      if (duration !== DURATION.FOREVER) this.close();
    });
  };

  close(duration) {
    let delay = typeof duration === 'undefined' ? this.duration : duration;

    if (delay === DURATION.FOREVER) delay = this.props.defaultCloseDelay || 250;

    if (!this.isShow && !this.state.isShow) return;
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      Animated.timing(this.state.opacityValue, {
        toValue: 0.0,
        duration: this.props.fadeOutDuration,
      }).start(() => {
        this.setState({
          isShow: false,
        });
        this.isShow = false;
        if (typeof this.callback === 'function') {
          this.callback();
        }
      });
    }, delay);
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  get toast() {
    let pos;
    switch (this.props.position) {
      case 'top':
        pos = this.props.positionValue;
        break;
      case 'center':
        pos = height / 2;
        break;
      case 'bottom':
        pos = height - this.props.positionValue;
        break;
    }

    const positionValue = this.state.opacityValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-72, this.props.positionValue],
    });

    const view = this.state.isShow ? (
      <Animated.View style={[styles.container, { top: positionValue }]} pointerEvents="none">
        <Animated.View style={[styles.content, { opacity: this.state.opacityValue }, this.props.style]}>
          {React.isValidElement(this.state.text) ? (
            this.state.text
          ) : (
            <Text style={this.props.textStyle}>{this.state.text}</Text>
          )}
        </Animated.View>
      </Animated.View>
    ) : null;
    return view;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
        {this.toast}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    elevation: 999,
    alignItems: 'center',
    zIndex: 10000,
  },
  content: {
    backgroundColor: 'green',
    borderRadius: 100,
    padding: 10,
  },
  text: {
    color: 'white',
  },
});

Toast.defaultProps = {
  position: 'top',
  textStyle: styles.text,
  positionValue: 24,
  fadeInDuration: 500,
  fadeOutDuration: 500,
  opacity: 1,
};
