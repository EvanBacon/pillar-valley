import { Animated, Easing } from "react-native";

export class RNAnimator {
  static to<T extends Record<string, any>>(
    target: T,
    duration: number,
    props: Partial<T>,
    settings: {
      delay?: number;
      onComplete?: () => void;
      onUpdate?: () => void;
      easing?: typeof Easing.linear;
    } = {}
  ) {
    // Extract keys to animate and setup initial Animated Values
    // const animatedValues = {};
    // const initialValues = {};
    // Object.keys(props).forEach((key) => {
    //   initialValue = target[key];
    //   if (typeof initialValue === "number") {
    //     animatedValues[key] = new Animated.Value(initialValue);
    //     initialValues[key] = initialValue;
    //     // Update the target object's property to be the Animated Value
    //     target[key] = animatedValues[key];
    //   }
    // });

    const animatedValues: Animated.Value[] = [];
    // Create an Animated.Value and listener for each property to animate
    const animations = Object.entries(props).map(([key, endValue]) => {
      const animatedValue = new Animated.Value(target[key]);

      animatedValues.push(animatedValue);
      // Set up a listener to update the actual property on target
      animatedValue.addListener(({ value }) => {
        target[key] = value;
        settings.onUpdate?.();
      });

      return Animated.timing(animatedValue, {
        toValue: endValue,
        duration,
        delay: settings.delay ?? 0,
        easing: settings.easing ?? Easing.linear,
        useNativeDriver: false, // This should be 'true' for supported properties for better performance
      });
    });

    // Start all animations together
    Animated.parallel(animations).start(({ finished }) => {
      if (finished) {
        // Call onComplete callback if provided
        settings.onComplete?.();

        animatedValues.map((animated) => animated.removeAllListeners());
      }
    });

    // // Create animations for each property
    // const animations = Object.keys(animatedValues).map((key) => {
    //   return Animated.timing(animatedValues[key], {
    //     toValue: options[key],
    //     duration,
    //     easing: props.easing ?? Easing.linear,
    //     useNativeDriver: false,
    //   });
    // });

    // Start all animations together
    // Animated.parallel(animations).start(() => {
    //   // On completion, update the original properties with final values
    //   Object.keys(animatedValues).forEach((key) => {
    //     target[key] = options[key];
    //   });
    //   props.onComplete?.();
    // });
  }
}
