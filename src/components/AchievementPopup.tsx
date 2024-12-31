import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Platform,
  Image,
  ImageSourcePropType,
} from "react-native";
import { router } from "expo-router";
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
const circleSize = 64;
const openWidth = circleSize * 5;

type AnimatedCircleProps = {
  innerColor?: string;
  outerColor?: string;
  toColor?: string;
  containerAnimation?: Animated.Value;
  style?: any;
  delay?: number;
  speed?: number;
  bounciness?: number;
  tension?: number;
  friction?: number;
  source?: ImageSourcePropType;
};

const AnimatedCircle = forwardRef((props: AnimatedCircleProps, ref) => {
  const {
    innerColor = Colors.green,
    outerColor = Colors.darkGreen,
    toColor,
    containerAnimation,
    style,
    delay = 0,
    speed,
    bounciness,
    tension = 14,
    friction = 4,
    source,
  } = props;
  const animation = useRef(new Animated.Value(0)).current;

  const reset = () => animation.setValue(0);

  const getAnimation = (override?: any) =>
    Animated.spring(animation, {
      delay,
      toValue: 1,
      speed,
      bounciness,
      tension,
      friction,
      useNativeDriver: containerAnimation ? false : useNativeDriver,
      ...(override || {}),
    });

  const getReverseAnimation = (override?: any) =>
    getAnimation({ toValue: 0, ...override });

  const animate = () => getAnimation().start();

  const animatedStyle = {
    backgroundColor: containerAnimation
      ? containerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [innerColor, toColor || innerColor],
        })
      : innerColor,
    transform: [{ scale: animation }],
  };

  useImperativeHandle(ref, () => ({
    reset,
    animate,
    getAnimation,
    getReverseAnimation,
  }));

  return (
    <Animated.View
      style={[
        {
          borderWidth: 10,
          borderRadius: circleSize / 2,
          width: circleSize,
          height: circleSize,
          aspectRatio: 1,
          position: "absolute",
          borderColor: outerColor,
          overflow: "hidden",
          alignItems: "stretch",
        },
        animatedStyle,
        style,
      ]}
    >
      {source && (
        <Image
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            padding: 10,
          }}
          resizeMode="contain"
          source={source}
        />
      )}
    </Animated.View>
  );
});

type BouncingCircleProps = {
  containerAnimation: Animated.Value;
};

const BouncingCircle = forwardRef((props: BouncingCircleProps, ref) => {
  const { containerAnimation } = props;
  const circles = useRef<any[]>([]).current;

  const reset = () => circles.forEach((item) => item?.reset?.());
  const getAnimation = () => {
    const anims = circles.map((c) => c?.getAnimation());
    return Animated.stagger(80, anims);
  };
  const getReverseAnimation = () => {
    const anims = circles.map((c, idx) => {
      const invIdx = circles.length - idx;
      let d = 100 * idx;
      if (idx === circles.length - 1) d = 0;
      return c?.getReverseAnimation?.({
        friction: 10,
        delay: d,
        velocity: 6 * invIdx,
      });
    });
    return Animated.parallel(anims);
  };
  const animate = () => getAnimation().start();

  useImperativeHandle(ref, () => ({
    reset,
    getAnimation,
    getReverseAnimation,
    animate,
  }));

  const circleColors = [
    [Colors.lightGreen, Colors.green],
    [Colors.darkerGreen, Colors.green],
    [Colors.transparent, Colors.darkGreen],
  ];

  const circleConfig = (index: number) => {
    let base = {
      delay: 120 * index,
      friction: 3 + index * 5,
      tension: 2 + index * 2,
    };
    if (index === 2) {
      base = { ...base, containerAnimation, toColor: Colors.green };
    }
    return base;
  };

  return (
    <View
      style={{
        width: circleSize,
        height: circleSize,
        justifyContent: "center",
        zIndex: 5,
      }}
    >
      {circleColors.map(([outer, inner], i) => (
        <AnimatedCircle
          key={"circle" + i}
          ref={(el) => el && (circles[i] = el)}
          outerColor={outer}
          innerColor={inner}
          {...circleConfig(i)}
        />
      ))}
      <AnimatedCircle
        ref={(el) => el && (circles[3] = el)}
        style={{
          position: "absolute",
          width: circleSize,
          height: circleSize,
          zIndex: 5,
          borderWidth: 0,
        }}
        source={require("../assets/images/expoBadge.png")}
        {...circleConfig(3)}
      />
    </View>
  );
});

type FirstTextProps = {
  containerAnimation: Animated.Value;
  renderUpperContents: () => JSX.Element;
  renderLowerContents: () => JSX.Element;
};

const FirstText = forwardRef((props: FirstTextProps, ref) => {
  const { containerAnimation, renderUpperContents, renderLowerContents } =
    props;
  const animation = useRef(new Animated.Value(0)).current;

  const reset = () => animation.setValue(0);
  const getAnimation = (toValue = 1, delay = 500) =>
    Animated.timing(animation, {
      toValue,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.cubic),
      duration: 600,
      delay,
    });
  const getReverseAnimation = () => getAnimation(0);

  const animate = () => getAnimation().start();

  useImperativeHandle(ref, () => ({
    reset,
    getAnimation,
    getReverseAnimation,
    animate,
  }));

  const opacity = containerAnimation.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
  });
  const translateX = containerAnimation.interpolate({
    inputRange: [0.5, 1],
    outputRange: [20, 0],
  });
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -circleSize],
  });

  return (
    <Animated.View
      style={[
        {
          overflow: "hidden",
          width: openWidth - circleSize,
          height: circleSize * 2,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {renderUpperContents()}
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {renderLowerContents()}
      </View>
    </Animated.View>
  );
});

type PopupProps = {
  setPresentAchievement: (val: { id: string; name: string } | null) => void;
  id: string;
  name: string;
  score?: number;
};

const PopupRender: ForwardRefRenderFunction<unknown, PopupProps> = (
  { setPresentAchievement, id, name, score },
  _
) => {
  const circleRef = useRef<any>(null);
  const firstTextRef = useRef<any>(null);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await AudioManager.playAsync("unlock");
      } finally {
        mounted && setTimeout(() => open(), 500);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const open = () => animate();

  const getAnimation = (toValue = 1, delay = 0) =>
    Animated.timing(animation, {
      toValue,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
      duration: 800,
      delay,
    });
  const getReverseAnimation = () => getAnimation(0, 2500);

  const animate = () => {
    Animated.sequence([
      circleRef.current?.getAnimation(),
      getAnimation(),
      firstTextRef.current?.getAnimation(1, 3000),
      getReverseAnimation(),
      circleRef.current?.getReverseAnimation(),
    ]).start(() => setPresentAchievement(null));
  };

  const containerStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 0.02],
      outputRange: [Colors.darkGreenTransparent, Colors.darkGreen],
    }),
    width: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [circleSize, openWidth],
    }),
    borderRadius: circleSize / 2,
    height: circleSize,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => router.push({ pathname: "/challenges", params: { id } })}
    >
      <Animated.View style={containerStyle}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              left: circleSize,
              borderTopRightRadius: circleSize / 2,
              borderBottomRightRadius: circleSize / 2,
              overflow: "hidden",
            },
          ]}
        >
          <FirstText
            renderUpperContents={() => (
              <View>
                <Text style={{ color: Colors.white, fontWeight: "bold" }}>
                  {name}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ color: Colors.white }}>
                    Challenge Complete!{" "}
                  </Text>
                  {score && (
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        paddingHorizontal: 4,
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: Colors.green }}>
                        {score}x
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
            containerAnimation={animation}
            ref={firstTextRef}
          />
        </View>
        <BouncingCircle containerAnimation={animation} ref={circleRef} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const Popup = forwardRef(PopupRender);

export function PopupContainer() {
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
