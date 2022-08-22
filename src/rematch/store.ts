import { init } from "@rematch/core";
import createRematchPersist from "@rematch/persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as models from "./models";

export const persistPlugin = createRematchPersist({
  whiteList: [
    "score",
    "user",
    "currency",
    "achievements",
    "rounds",
    "bestRounds",
    "storeReview",
  ],
  //   throttle: 5000,
  version: 2,
  storage: AsyncStorage,
});

export const store = init({
  models,
  plugins: [persistPlugin],
});

export const { dispatch } = store;
global.dispatch = dispatch;
