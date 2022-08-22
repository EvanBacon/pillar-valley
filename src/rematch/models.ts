import firebase from "firebase/app";
import { Alert, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Settings from "../constants/Settings";
import Fire from "../ExpoParty/Fire";
import GameStates from "../Game/GameStates";
import Constants from "expo-constants";
import { captureRef } from "react-native-view-shot";

import getDeviceInfo from "../utils/getUserInfo";
import * as Analytics from "expo-firebase-analytics";
import Challenges from "../constants/Achievements";
import * as StoreReview from "expo-store-review";

export const skins = {
  state: {},
  reducers: {
    setBest: (state, best) => ({ ...state, best }),
    increment: ({ current, best, isBest, ...props }) => {},
  },
  effects: {
    sync: () => {},
    unlock: ({ key }, { skins }) => {
      if (skins) {
      }
    },
  },
};

export type PresentAchievementShape = null | {
  id: string;
  name: string;
};

export const presentAchievement = {
  state: null,
  reducers: {
    set: (
      state: PresentAchievementShape,
      val: PresentAchievementShape
    ): PresentAchievementShape => val,
  },
  effects: {},
};

export type AchievementsShape = Record<string, true>;

export const achievements = {
  state: {},
  reducers: {
    _reset: () => ({}),
    set: (
      state: AchievementsShape,
      val: AchievementsShape
    ): AchievementsShape => ({ ...state, ...val }),
  },
  effects: {
    sync: () => {},
    unlock: (
      key: string,
      { achievements }: { achievements: AchievementsShape }
    ) => {
      if (!achievements[key] && Challenges[key]) {
        Analytics.logEvent("achievement_unlocked", {
          id: [key],
          ...Challenges[key],
        });
        dispatch.achievements.set({ [key]: true });
        dispatch.presentAchievement.set({ id: key, ...Challenges[key] });
      }
    },
  },
};

import { promptToReviewAsync } from "../utils/promptStoreReview";

// A cached value that represents the amount of times a user has beaten their best score.
// Logic for store review:
// Since you can only prompt to review roughly once, we want to ensure that only users who like the game are prompted to rate it.
// We can determine if they like the game based on if they keep playing it.
export const bestRounds = {
  state: 0,
  reducers: {
    _reset: () => 0,
    set: (state: number, rounds: number): number => rounds,
  },
  effects: {
    increment: (
      input: unknown,
      { score, bestRounds }: { score: ScoreShape; bestRounds: number }
    ) => {
      const next = bestRounds + 1;

      Analytics.logEvent("had_best_round", {
        count: bestRounds,
        score: score.total,
      });

      // if the user ever beats their highscore twice after the first day of using the app, prompt them to rate the app.
      if (bestRounds > 1) {
        dispatch.storeReview.promptAsync();
      }

      dispatch.bestRounds.set(next);
    },
  },
};

function hasBeenAtLeastOneDaySinceTime(time: number): boolean {
  // 1 Day after the last prompt time (or since the app was first opened).
  const appropriateTimeToAskAgain = new Date(time);
  // DEBUG: Wait 20 seconds
  // appropriateTimeToAskAgain.setSeconds(
  //   appropriateTimeToAskAgain.getSeconds() + 20
  // );
  // Wait 1 day
  appropriateTimeToAskAgain.setDate(appropriateTimeToAskAgain.getDate() + 1);
  const hasBeenAtLeastOneDay = new Date() > appropriateTimeToAskAgain;
  return hasBeenAtLeastOneDay;
}

export type StoreReviewShape = {
  promptTime: number;
};

export const storeReview = {
  state: { promptTime: Date.now() },
  reducers: {
    _reset: () => ({ promptTime: Date.now() }),
    set: (
      state: StoreReviewShape,
      value: Partial<StoreReviewShape>
    ): StoreReviewShape => ({ ...state, ...value }),
  },
  effects: {
    promptAsync: async (
      input: unknown,
      { storeReview }: { storeReview: StoreReviewShape }
    ) => {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return;
      const isReady = hasBeenAtLeastOneDaySinceTime(storeReview.promptTime);
      console.log("prompt async: ", storeReview.promptTime);
      if (!isReady) return;

      dispatch.storeReview.set({ promptTime: Date.now() });
      await promptToReviewAsync();
    },
  },
};

export const rounds = {
  state: 0,
  reducers: {
    _reset: () => 0,
    set: (state: number, rounds: number): number => rounds,
  },
  effects: {
    increment: (input: unknown, { rounds }: { rounds: number }) => {
      const next = rounds + 1;
      if (next === 10) {
        dispatch.achievements.unlock("rounds-10");
      } else if (next === 50) {
        dispatch.achievements.unlock("rounds-50");
      } else if (next === 100) {
        dispatch.achievements.unlock("rounds-100");
      } else if (next === 500) {
        dispatch.achievements.unlock("rounds-500");
      } else if (next === 1000) {
        dispatch.achievements.unlock("rounds-1000");
      }
      dispatch.rounds.set(next);
    },
  },
};

export type ScoreShape = {
  current: number;
  best: number;
  total: number;
  last: number | null;
  isBest: boolean;
};

const initialScoreState: ScoreShape = {
  current: 0,
  best: 0,
  total: 0,
  last: null,
  isBest: false,
};

export const score = {
  state: { ...initialScoreState },
  reducers: {
    _hardReset: () => ({ ...initialScoreState }),
    setBest: (state: ScoreShape, best: number): ScoreShape => ({
      ...state,
      best,
    }),
    setTotal: (state: ScoreShape, total: number): ScoreShape => ({
      ...state,
      total,
    }),
    increment: ({
      current,
      best,
      isBest,
      ...props
    }: ScoreShape): ScoreShape => {
      const nextScore = current + 1;

      return {
        current: nextScore,
        best: Math.max(nextScore, best),
        isBest: nextScore > best,
        ...props,
      };
    },
    _reset: (state: ScoreShape): ScoreShape => ({
      ...state,
      current: 0,
      last: state.current,
      isBest: false,
    }),
  },
  effects: {
    updateTotal(current: number, { score }: { score: ScoreShape }) {
      const total = score.total + current;

      if (current > 100) {
        dispatch.achievements.unlock("score-100");
      } else if (current > 50) {
        dispatch.achievements.unlock("score-50");
      } else if (current > 20) {
        dispatch.achievements.unlock("score-20");
      }

      if (total > 10000) {
        dispatch.achievements.unlock("total-score-10000");
      } else if (total > 5000) {
        dispatch.achievements.unlock("total-score-5000");
      } else if (total > 1000) {
        dispatch.achievements.unlock("total-score-1000");
      } else if (total > 500) {
        dispatch.achievements.unlock("total-score-500");
      }
      dispatch.score.setTotal(total);
    },
    reset: (props: unknown, { score }: { score: ScoreShape }) => {
      if (Settings.isEveryScoreBest) {
        dispatch.score.setHighScore(score.current);
      } else if (score.isBest) {
        dispatch.score.setHighScore(score.best);
      }

      dispatch.score.updateTotal(score.current);
      dispatch.score._reset();
      dispatch.rounds.increment();
    },
    setHighScore: async (highScore: number, { user }) => {
      dispatch.bestRounds.increment();

      if (!Settings.isFirebaseEnabled) {
        return;
      }
      const { displayName, photoURL } = user;

      console.log("set High score", highScore);
      const _displayName = parseName(displayName);
      const docRef = Fire.doc;
      try {
        await Fire.db.runTransaction((transaction) =>
          transaction.get(docRef).then((doc) => {
            if (!doc.exists) {
              throw new Error("Document does not exist!");
            }

            const data = doc.data();
            const cloudHighScore = data.score || 0;
            console.log("cloud score", cloudHighScore);
            if (Settings.isEveryScoreBest || highScore > cloudHighScore) {
              transaction.update(docRef, {
                score: highScore,
                timestamp: Date.now(),
                displayName: _displayName,
                photoURL: photoURL || "",
              });
            } else {
              transaction.update(docRef, {
                ...data,
                displayName: _displayName,
                photoURL: photoURL || "",
              });
              dispatch.score.setBest(cloudHighScore);
            }
          })
        );
        console.log("Successfully wrote score");
      } catch ({ message }) {
        console.log("Failed to write score", message);
        Alert.alert(message);
      }
    },
  },
};

export const currency = {
  state: {
    current: 0,
  },
  reducers: {
    change: ({ current, ...props }, value) => {
      return {
        current: current + value,
        ...props,
      };
    },
    _reset: (state) => ({
      ...state,
      current: 0,
    }),
  },
  effects: {},
};

export const game = {
  state: GameStates.Menu,
  reducers: {
    play: () => GameStates.Playing,
    menu: () => GameStates.Menu,
  },
  effects: {},
};

export const muted = {
  state: false,
  reducers: {
    toggle: (state: boolean): boolean => {
      Analytics.logEvent("toggle_music", { on: !state });
      return !state;
    },
  },
  effects: {},
};

export const screenshot = {
  state: null,
  reducers: {
    update: (state, uri) => uri,
  },
  effects: {
    updateAsync: async ({ ref }) => {
      const { width, height } = Dimensions.get("window");

      const uri = await captureRef(ref, {
        format: "jpg",
        quality: 0.3,
        result: "tmpfile",
        // result: "file",
        height,
        width,
      });

      dispatch.screenshot.update(uri);
    },
  },
};

async function incrementDailyReward() {
  const timestamp = Date.now();
  return new Promise((res, rej) => {
    Fire.db
      .runTransaction((transaction) =>
        transaction.get(Fire.doc).then((userDoc) => {
          console.log("Fire.doc", Fire.doc);
          if (!userDoc.exists) {
            throw new Error("Document does not exist!");
          }

          const data = userDoc.data();
          const { lastRewardTimestamp } = data;

          const hours = Math.abs(lastRewardTimestamp - timestamp) / 36e5; // 60000;

          if (hours >= 24) {
            if (hours >= 48) {
              // console.log('More than a day');
              // It has been more than 1 day since the last visit - break the streak
              const newDailyVisits = 0;
              transaction.update(Fire.doc, {
                dailyVisits: newDailyVisits,
                lastRewardTimestamp: timestamp,
              });
              // / TODO:EVAN: save timestamp
              // this.userData.lastRewardTimestamp = timestamp;
              return newDailyVisits;
            }
            // console.log('You were here yesterday');
            // Perfect! It has been 1 day since the last visit - increment streak and save current time

            const dailyVisits = data.dailyVisits || 0;
            const newDailyVisits = dailyVisits + 1;
            transaction.update(Fire.doc, {
              dailyVisits: newDailyVisits,
              lastRewardTimestamp: timestamp,
            });
            // / TODO:EVAN: save timestamp
            // this.userData.lastRewardTimestamp = timestamp;
            return newDailyVisits;
          }
          // console.log('Within day');
          transaction.update(Fire.doc, {
            dailyVisits: data.dailyVisits || 0,
            lastRewardTimestamp: data.lastRewardTimestamp || Date.now(),
          });

          // It hasn't been a day yet - do nothing

          return data.dailyVisits || 0;
        })
      )
      .then(res)
      .catch(rej);
  });
}

export const dailyStreak = {
  state: 0,
  reducers: {
    increment: (s) => s + 1,
    set: (s, props) => props,
    reset: () => 0,
  },
  effects: {
    rewardUser: async (streak) => {
      console.log("award", streak);
    },
    compareDaily: async (props, { user }) => {
      const dailyVisits = await incrementDailyReward();

      if (dailyVisits !== user.dailyVisits) {
        // console.log('Yay! You came back, your streak is now at: ' + dailyVisits);

        dispatch.dailyStreak.set(dailyVisits);
        if (dailyVisits > user.dailyVisits) {
          dispatch.dailyStreak.rewardUser(dailyVisits);
        }
        dispatch.user.update({ dailyVisits });
        // / Give reward!
      } else {
        // console.log('ummmm', dailyVisits);
      }
    },
  },
};

function mergeInternal(state, { uid, user }) {
  const { [uid]: currentUser, ...otherUsers } = state;
  return {
    ...otherUsers,
    [uid]: { ...(currentUser || {}), ...user },
  };
}

function parseName(inputName, backupName) {
  let name = inputName || backupName || "Markipillar";
  if (typeof name === "string") {
    name = name.trim();
  }
  return name;
}

export const leaders = {
  state: {},
  reducers: {
    batchUpdate: (state, users) => {
      let nextData = state;
      for (const user of users) {
        nextData = mergeInternal(nextData, user);
      }
      return nextData;
    },
    update: (state, { uid, user }) => mergeInternal(state, { uid, user }),
    set: (state, { uid, user }) => {
      const { [uid]: currentUser, ...otherUsers } = state;
      return {
        ...otherUsers,
        [uid]: user,
      };
    },
    clear: () => ({}),
  },
  effects: {
    getPagedAsync: async ({ start, size, callback }) => {
      // This is just a place holder to prevent constant updates in development
      if (__DEV__) {
        dispatch.leaders.batchUpdate([
          {
            uid: "0oK50HoGt6PqXG1ApBTroS3IxR23",
            user: {
              key: "0oK50HoGt6PqXG1ApBTroS3IxR23",
              uid: "0oK50HoGt6PqXG1ApBTroS3IxR23",
              displayName: "Evan Bacon",
              dailyVisits: 1,
              lastRewardTimestamp: 1531172844644,
              photoURL: "https://graph.facebook.com/10209775308018161/picture",
              rank: 999999,
              score: 33,
              timestamp: 1531019432478,
            },
          },
          {
            uid: "R2XBuw9im3QBtpU6YYck2tdhpEI3",
            user: {
              key: "R2XBuw9im3QBtpU6YYck2tdhpEI3",
              uid: "R2XBuw9im3QBtpU6YYck2tdhpEI3",
              displayName: "Expo iPhone X",
              appOwnership: "expo",
              dailyVisits: 0,
              deviceId: "9E917464-CF47-417B-AA41-07E52190F26A",
              deviceName: "Expo iPhone X",
              deviceYearClass: 2017,
              expoVersion: "2.4.7.1013849",
              isDevice: true,
              lastRewardTimestamp: 1524197897114,
              platform: {
                ios: {
                  buildNumber: "2.4.7.1013849",
                  model: "iPhone X",
                  platform: "iPhone10,6",
                  systemVersion: "11.0.1",
                  userInterfaceIdiom: "handset",
                },
              },
              score: 1,
              slug: "crossy-road",
            },
          },
        ]);
        return;
      }

      const collection = firebase
        .firestore()
        .collection(Settings.slug)
        .where("score", ">", 0);

      let ref = collection.orderBy("score", "desc").limit(size);
      try {
        if (start) {
          ref = ref.startAfter(start);
        }
        const querySnapshot = await ref.get();

        const data = [];
        querySnapshot.forEach((doc) => {
          if (!doc.exists) {
            console.log("leaders.getPagedAsync(): Error: data doesn't exist", {
              size,
              start,
            });
          } else {
            const _data = doc.data();
            const uid = doc.id;
            data.push({
              uid,
              user: {
                key: uid,
                uid,
                displayName: parseName(_data.displayName, _data.deviceName),
                ..._data,
              },
            });
          }
        });
        console.log("Batch update", data.length, JSON.stringify(data));
        // console.log("Batch update", data.length, { data });
        dispatch.leaders.batchUpdate(data);
        const cursor = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (callback) callback({ data, cursor, noMore: data.length < size });
        return;
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
      if (callback) callback({});
    },
    getAsync: async ({ uid, callback }) => {
      try {
        const ref = firebase.firestore().collection(Settings.slug).doc(uid);
        const doc = await ref.get();
        if (!doc.exists) {
          if (uid === Fire.uid) {
            const currentUser = firebase.auth().currentUser || {};

            const _displayName = parseName(
              currentUser.displayName,
              Constants.deviceName
            );

            const nUser = {
              rank: 999999,
              displayName: _displayName,
              photoURL: currentUser.photoURL || "",
              score: 0,
              timestamp: Date.now(),
            };
            ref.set(nUser);
            if (callback) callback(nUser);
            return;
          }
          console.log(`No document: leaders/${uid}`);
        } else {
          const user = doc.data();
          console.log("got leader", user);
          dispatch.leaders.update({ uid, user });
          if (callback) callback(user);
          return;
        }
      } catch ({ message }) {
        console.log("Error: leaders.get", message);
        alert(message);
      }
      if (callback) callback(null);
    },
  },
};

export const players = {
  state: {},
  reducers: {
    update: (state, { uid, user }) => {
      const { [uid]: currentUser, ...otherUsers } = state;
      return {
        ...otherUsers,
        [uid]: { ...(currentUser || {}), ...user },
      };
    },
    set: (state, { uid, user }) => {
      const { [uid]: currentUser, ...otherUsers } = state;
      return {
        ...otherUsers,
        [uid]: user,
      };
    },
    clear: () => ({}),
  },
  effects: {
    getAsync: async ({ uid, callback }) => {
      // DO NOTHING IN DEV
      return;
      try {
        const ref = firebase.firestore().collection("players").doc(uid);
        const doc = await ref.get();
        if (!doc.exists) {
          console.log(`No document: players/${uid}`);
          if (uid === Fire.uid) {
            const currentUser = firebase.auth().currentUser || {};
            const _displayName = parseName(
              currentUser.displayName,
              Constants.deviceName
            );

            const user = {
              rank: 999999,
              displayName: _displayName,
              score: 0,
              timestamp: Date.now(),
            };
            if (currentUser.photoURL) {
              user.photoURL = currentUser.photoURL;
            }
            ref.add(user);
            dispatch.players.update({ uid, user });
            if (callback) callback(user);
          } else {
            dispatch.leaders.getAsync({
              uid,
              callback: (user) => {
                if (user) {
                  dispatch.players.update({ uid, user });
                }
                if (callback) callback(user);
              },
            });
          }
        } else {
          const user = doc.data();
          console.log("got player", user);
          dispatch.players.update({ uid, user });
          if (callback) callback(user);
        }
      } catch ({ message }) {
        console.log("Error: players.get", message);
        Alert.alert(message);
      }
    },
  },
};

function reduceFirebaseUser(user) {
  const nextUser = user;
  const possibleUpdates = {};

  if (user.providerData && user.providerData.length > 0) {
    const facebookData = user.providerData[0];
    nextUser.fbuid = facebookData.uid;
    const keysToCheck = ["displayName", "photoURL"];
    for (const key of keysToCheck) {
      if (!nextUser[key] && facebookData[key]) {
        possibleUpdates[key] = facebookData[key];
      }
    }
    if (Object.keys(possibleUpdates).length > 0) {
      const user = firebase.auth().currentUser;
      console.log({ possibleUpdates });
      firebase.auth().currentUser.updateProfile(possibleUpdates);
    }
    // //DEBUG Clear
    // firebase
    //   .auth()
    //   .currentUser.updateProfile({ displayName: null, photoURL: null });
  }

  const {
    uid,
    photoURL,
    phoneNumber,
    lastLoginAt,
    isAnonymous,
    fbuid,
    displayName,
    emailVerified,
    email,
    createdAt,
  } = nextUser;

  return {
    uid,
    photoURL: photoURL || "",
    phoneNumber,
    lastLoginAt,
    isAnonymous,
    fbuid,
    displayName: displayName || Constants.deviceName,
    emailVerified,
    email,
    createdAt,
    ...possibleUpdates,

    // stsTokenManager,
    // redirectEventId,
    // authDomain,
    // appName,
    // apiKey
  };
}

export const user = {
  state: null,
  reducers: {
    update: (state, props) => ({ ...state, ...props }),
    set: (state, props) => props,
    clear: () => null,
  },
  effects: {
    logoutAsync: async (props, { players }) => {
      try {
        const uid = firebase.auth().currentUser.uid;
        await firebase.auth().signOut();
        // dispatch.leaders.set({ uid, user: null });
      } catch ({ message }) {
        console.log("ERROR: user.logoutAsync: ", message);
        Alert.alert(message);
      }
    },
    signInAnonymously: () => {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        console.log("Error: signInAnonymously", message);
        Alert.alert(message);
      }
    },
    observeAuth: (props) => {
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          // TODO: Evan: Y tho...
          dispatch.user.clear();
          dispatch.user.signInAnonymously();
        } else {
          dispatch.user.getAsync();
          // DISABLED IN DEV
          // dispatch.leaders.getAsync({ uid: user.uid });
        }
      });
    },
    getAsync: async (props, { user: localUserData }) => {
      const nextLocalUserData = localUserData || {};
      let combinedUserData = {};
      const firebaseAuthData = firebase.auth().currentUser.toJSON();

      if (firebaseAuthData == null) {
        console.warn(
          "models: Shouldn't call user.getAsync until the user is authed"
        );
        return;
      }
      const nextFirebaseAuthData = reduceFirebaseUser(firebaseAuthData);
      const deviceInfo = getDeviceInfo();

      combinedUserData = {
        ...deviceInfo,
        ...nextFirebaseAuthData,
      };

      const updates = {};
      for (const key of Object.keys(combinedUserData)) {
        if (
          combinedUserData[key] != undefined &&
          combinedUserData[key] !== nextLocalUserData[key]
        ) {
          updates[key] = combinedUserData[key];
        }
      }
      if (Object.keys(updates).length > 0) {
        dispatch.user.update(updates);
      }
      // dispatch.dailyStreak.compareDaily();
      dispatch.players.update({
        uid: combinedUserData.uid,
        user: combinedUserData,
      });
      // THIS IS DEV ONLY
      return;
    },
    mergeDataWithFirebase: async (props) => {
      const doc = await firebase
        .firestore()
        .collection("players")
        .doc(Fire.uid);
      const setWithMerge = doc.set(props, { merge: true });
    },
    syncLocalToFirebase: async (
      props,
      { user: { additionalUserInfo, credential, user, ...otherUserProps } }
    ) => {
      console.log("syncLocalToFirebase", otherUserProps);
      const doc = await firebase
        .firestore()
        .collection("players")
        .doc(Fire.uid);
      const setWithMerge = doc.set(otherUserProps, { merge: true });
    },
    setGameData: (props) => {
      const { uid, doc } = Fire;
      if (!uid) {
        // todo: add error
        return;
      }
      const setWithMerge = doc.set(props, { merge: true });
    },
  },
};

/**
 *
 * @param urlAsKey
 * @param expireInMinutes
 * @returns {Promise.<*>}
 */

async function setItemWithExpiration(key, value, minutes) {
  // set expire at
  value = { value, expireAt: getExpireDate(minutes) };
  // stringify object
  const objectToStore = JSON.stringify(value);
  // store object
  return AsyncStorage.setItem(key, objectToStore);
}

async function getItemWithExpiration(urlAsKey) {
  let data;
  await AsyncStorage.getItem(urlAsKey, async (err, value) => {
    data = JSON.parse(value);

    // there is data in cache && cache is expired
    if (
      data !== null &&
      data.expireAt &&
      new Date(data.expireAt) < new Date()
    ) {
      // clear cache
      AsyncStorage.removeItem(urlAsKey);

      // update res to be null
      data = null;
    } else {
      console.log("read data from cache  ");
    }
  });
  if (data) {
    return data.value;
  }
}

function getExpireDate(expireInMinutes) {
  const now = new Date();
  const expireTime = new Date(now);
  expireTime.setMinutes(now.getMinutes() + expireInMinutes);
  return expireTime;
}
