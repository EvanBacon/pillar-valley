import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AudioManager from "../AudioManager";
import { usePresentAchievement } from "../zustand/models";

const Colors = {
  darkerGreen: "#000A69",
  darkGreen: "rgba(6, 20, 150, 1)",
  darkGreenTransparent: "rgba(6, 20, 150, 0)",
  green: "#4630eb",
  lightGreen: "#5465FF",
  white: "white",
  transparent: "transparent",
};
const useNativeDriver = Platform.select({ web: false, default: true });

class AnimatedCircle extends React.Component {
  static defaultProps = {
    renderComponent: (props) => <Animated.View {...props} />,
    toValue: 1,
    delay: 0,
    // speed: 12 * 0.2,
    // bounciness: 8,
    tension: 3.5 * 4,
    friction: 4,
    useNativeDriver,
  };
  animation = new Animated.Value(0);

  reset = () => {
    this.animation.setValue(0);
  };

  getAnimation = (props = {}) => {
    const { reverse } = props;

    const {
      delay,
      toValue,
      speed,
      bounciness,

      tension,
      friction,
      useNativeDriver,
      containerAnimation,
    } = this.props;
    return Animated.spring(this.animation, {
      delay,
      toValue,
      speed,
      bounciness,
      tension,
      friction,
      useNativeDriver: containerAnimation ? false : useNativeDriver,
      ...props,
    });
  };

  getReverseAnimation = (props = {}) =>
    this.getAnimation({ toValue: 0, reverse: true, velocity: 10, ...props });

  animate = () => {
    this.getAnimation().start();
  };

  get animatedStyle() {
    const { innerColor, toColor, containerAnimation } = this.props;

    let backgroundColor = innerColor;
    if (containerAnimation) {
      backgroundColor = containerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [innerColor, toColor || innerColor],
      });
    }

    return {
      backgroundColor,
      transform: [{ scale: this.animation }],
    };
  }

  render() {
    const { innerColor, outerColor, style, renderComponent, ...props } =
      this.props;

    const finalProps = {
      style: [
        {
          borderWidth: 10,
          borderRadius: circleSize / 2,
          width: circleSize,
          height: circleSize,
          aspectRatio: 1,
          position: "absolute",

          // minWidth: circleSize,
          // maxWidth: circleSize,
          // minHeight: circleSize,
          // maxHeight: circleSize,
          borderColor: outerColor,
          backgroundColor: innerColor,
        },
        this.animatedStyle,
        style,
      ],
      ...props,
    };
    return renderComponent(finalProps);
  }
}

class AnimatedBadge extends React.Component {
  static defaultProps = {
    renderComponent: (props) => <Animated.Image {...props} />,
    resizeMode: "contain",
  };

  getReverseAnimation = (props) => this.circle?.getReverseAnimation(props);
  getAnimation = (toValue) => this.circle?.getAnimation(toValue);
  animate = () => this.circle?.animate();
  reset = () => this.circle?.reset();
  render() {
    const { ...props } = this.props;
    return <AnimatedCircle ref={(ref) => (this.circle = ref)} {...props} />;
  }
}

const circleSize = 64;
const openWidth = circleSize * 5;

class BouncingCircle extends React.Component {
  reset = () => {
    this.circles.forEach((circle) => circle.reset());
  };

  getAnimation = () => {
    const animations = this.circles.map((circle) => circle.getAnimation());
    return Animated.stagger(80, animations);
  };

  getReverseAnimation = () => {
    const animations = this.circles.map((circle, index) => {
      const inverseIndex = this.circles.length - index;
      let delay = 100 * index;
      if (index === this.circles.length - 1) {
        delay = 0;
      }
      return circle.getReverseAnimation({
        friction: 10,
        delay,
        velocity: 6 * inverseIndex,
      });
    });
    return Animated.parallel(animations);
  };

  animate = () => {
    this.getAnimation().start();
  };

  circleConfig = (index) => {
    let config = {
      delay: 120 * index,
      friction: 3 + index * 5,
      tension: 2 + index * 2,
    };

    if (index === 2) {
      config = {
        ...config,
        containerAnimation: this.props.containerAnimation,
        toColor: Colors.green,
        useNativeDriver: false,
      };
    }
    return config;
  };

  circles = [];
  colors = [
    [Colors.lightGreen, Colors.green],
    [Colors.darkerGreen, Colors.green],
    [Colors.transparent, Colors.darkGreen],
  ];

  _reset = () => {
    this.reset();
    this.animate();
  };

  render() {
    return (
      <View
        style={{
          width: circleSize,
          height: circleSize,
          justifyContent: "center",
        }}
      >
        {this.colors.map(([outer, inner], index) => (
          <AnimatedCircle
            key={"d" + index}
            ref={(ref) => this.circles.push(ref)}
            outerColor={outer}
            innerColor={inner}
            {...this.circleConfig(index)}
          />
        ))}
        <AnimatedBadge
          source={require("../assets/images/expoBadge.png")}
          ref={(ref) => this.circles.push(ref)}
          style={{
            resizeMode: "contain",
            position: "absolute",
            width: circleSize,
            height: "60%",
            borderWidth: 0,
          }}
          {...this.circleConfig(3)}
        />
      </View>
    );
  }
}

class FirstText extends React.Component {
  reset = () => {
    this.animation.setValue(0);
  };

  open = () => {
    this.animate();
  };

  getAnimation = (toValue = 1, delay = 500) =>
    Animated.timing(this.animation, {
      toValue,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.cubic),
      duration: 600,
      delay,
    });

  getReverseAnimation = () => this.getAnimation(0);

  animate = () => {
    this.getAnimation().start();
  };

  animation = new Animated.Value(0);

  get firstTextAnimatedStyle() {
    const inputRange = [0.5, 1];

    const opacity = this.props.containerAnimation.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0, 1],
    });
    const translateX = this.props.containerAnimation.interpolate({
      inputRange,
      outputRange: [20, 0],
    });

    const translateY = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -circleSize],
    });

    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  }

  render() {
    return (
      <Animated.View
        style={[
          {
            overflow: "hidden",
            width: openWidth - circleSize,
            height: circleSize * 2,
          },
          this.firstTextAnimatedStyle,
        ]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {this.props.renderUpperContents()}
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {this.props.renderLowerContents()}
        </View>
      </Animated.View>
    );
  }
}

type PopupProps = {
  setPresentAchievement: (
    challenge: { id: string; name: string } | null
  ) => void;
  id: string;
  name: string;
};
class Popup extends React.Component<PopupProps> {
  // parallel(animations, config?)

  async componentDidMount() {
    try {
      await AudioManager.playAsync("unlock");
    } finally {
      setTimeout(() => {
        this.open();
      }, 500);
    }
  }

  reset = () => {
    this.circle.reset();
    this.firstText.reset();
    this.animation.setValue(0);
  };

  open = () => {
    // this.circle.animate();
    this.animate();
  };

  getAnimation = (toValue = 1, delay = 0) =>
    Animated.timing(this.animation, {
      toValue,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
      duration: 800,
      delay,
    });

  getReverseAnimation = () => this.getAnimation(0, 2500);

  animate = () => {
    Animated.sequence([
      this.circle.getAnimation(),
      this.getAnimation(),
      this.firstText.getAnimation(1, 3000),
      this.getReverseAnimation(),
      this.circle.getReverseAnimation(),
    ]).start(() => {
      this.props.setPresentAchievement(null);
    });
    // this.getAnimation().start();
  };

  circleConfig = (index) => {
    const config = {
      delay: 120 * index,
      friction: 3 + index * 5,
      tension: 2 + index * 2,
    };

    if (index === 2) {
      config["toColor"] = "orange";
    }
    return config;
  };

  circles = [];

  _reset = () => {
    this.reset();
    this.open();
  };

  animation = new Animated.Value(0);

  get animatedContainerStyle() {
    const width = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [circleSize, openWidth],
    });
    const backgroundColor = this.animation.interpolate({
      inputRange: [0, 0.02],
      outputRange: [Colors.darkGreenTransparent, Colors.darkGreen],
    });
    return {
      backgroundColor,
      borderRadius: circleSize / 2,
      height: circleSize,
      width,
      flexDirection: "row",
      alignItems: "flex-start",
    };
  }

  get firstTextAnimatedStyle() {
    const inputRange = [0.5, 1];
    const opacity = this.animation.interpolate({
      inputRange,
      outputRange: [0, 1],
    });
    const translateX = this.animation.interpolate({
      inputRange,
      outputRange: [20, 0],
    });
    return {
      opacity,
      transform: [{ translateX }],
    };
  }

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          router.push({
            pathname: "/challenges",
            params: { id: this.props.id },
          });
        }}
      >
        <Animated.View style={this.animatedContainerStyle}>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              left: circleSize,
              borderTopRightRadius: circleSize / 2,
              borderBottomRightRadius: circleSize / 2,
              overflow: "hidden",
            }}
          >
            <FirstText
              renderUpperContents={() => (
                <View>
                  <Text
                    style={{
                      color: Colors.white,
                      marginHorizontal: 8,
                      fontWeight: "bold",
                    }}
                  >
                    {this.props.name}
                  </Text>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: Colors.white,
                        marginHorizontal: 8,
                      }}
                    >
                      Challenge Complete!{" "}
                    </Text>
                    {this.props.score && (
                      <View
                        style={{
                          backgroundColor: "white",
                          borderRadius: 10,
                          paddingHorizontal: 4,
                        }}
                      >
                        <Text
                          style={{ fontWeight: "bold", color: Colors.green }}
                        >
                          {this.props.score || 0}x
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              renderLowerContents={() => (
                <Text style={{ color: Colors.white, fontWeight: "bold" }}>
                  Tap for details
                </Text>
              )}
              containerAnimation={this.animation}
              ref={(ref) => (this.firstText = ref)}
            />
          </View>

          <BouncingCircle
            containerAnimation={this.animation}
            ref={(ref) => (this.circle = ref)}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

function PopupContainer() {
  const { presentAchievement, set } = usePresentAchievement();
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { top, padding: 16, alignItems: "center" },
      ]}
      pointerEvents="box-none"
    >
      {presentAchievement && (
        <Popup
          setPresentAchievement={set}
          id={presentAchievement.id}
          name={presentAchievement.name}
        />
      )}
    </View>
  );
}

export default PopupContainer;
