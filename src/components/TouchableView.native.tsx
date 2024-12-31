import React from "react";
import { PanResponder, View, ViewProps } from "react-native";

interface TouchableViewProps extends ViewProps {
  onTouchesBegan?: () => void;

  onStartShouldSetPanResponderCapture?: () => boolean;
}

const TouchableView: React.FC<TouchableViewProps> = ({
  onTouchesBegan = () => {},
  onStartShouldSetPanResponderCapture = () => true,
  children,
  ...props
}) => {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponderCapture,
    onPanResponderGrant: () => onTouchesBegan(),
  });

  return (
    <View {...props} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default TouchableView;
