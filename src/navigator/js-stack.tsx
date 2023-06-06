import {
  createStackNavigator,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { withLayoutContext } from "expo-router";

const { Navigator } = createStackNavigator();

export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator
>(Navigator);
