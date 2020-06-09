import { dispatch } from "@rematch/core";
import firebase from "firebase/app";
import { Alert, AsyncStorage, Dimensions } from "react-native";

import Settings from "../constants/Settings";
import Fire from "../ExpoParty/Fire";
import GameStates from "../Game/GameStates";
import Constants from "expo-constants";
import * as Facebook from "expo-facebook";
import { takeSnapshotAsync } from "expo";
import getDeviceInfo from "../utils/getUserInfo";

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

export const score = {
  state: {
    current: 0,
    best: 0,
    last: null,
    isBest: false,
  },
  reducers: {
    setBest: (state, best) => ({ ...state, best }),
    increment: ({ current, best, isBest, ...props }) => {
      const nextScore = current + 1;

      return {
        current: nextScore,
        best: Math.max(nextScore, best),
        isBest: nextScore > best,
        ...props,
      };
    },
    _reset: (state) => ({
      ...state,
      current: 0,
      last: state.current,
      isBest: false,
    }),
  },
  effects: {
    reset: (props, { score }) => {
      if (Settings.isFirebaseEnabled) {
        if (Settings.isEveryScoreBest) {
          dispatch.score.setHighScore(score.current);
        } else if (score.isBest) {
          dispatch.score.setHighScore(score.best);
        }
      }
      dispatch.score._reset();
    },
    setHighScore: async (highScore, { user: { displayName, photoURL } }) => {
      console.log("set High score", highScore);
      const _displayName = parseName(displayName);
      const docRef = Fire.shared.doc;
      try {
        await Fire.shared.db.runTransaction((transaction) =>
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
    toggle: (state) => !state,
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
      const options = {
        format: "jpg",
        quality: 0.3,
        result: "file",
        height,
        width,
      };
      const uri = await takeSnapshotAsync(ref, options);
      dispatch.screenshot.update(uri);
    },
  },
};

async function incrementDailyReward() {
  const timestamp = Date.now();
  return new Promise((res, rej) => {
    Fire.shared.db
      .runTransaction((transaction) =>
        transaction.get(Fire.shared.doc).then((userDoc) => {
          console.log("Fire.shared.doc", Fire.shared.doc);
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
              transaction.update(Fire.shared.doc, {
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
            transaction.update(Fire.shared.doc, {
              dailyVisits: newDailyVisits,
              lastRewardTimestamp: timestamp,
            });
            // / TODO:EVAN: save timestamp
            // this.userData.lastRewardTimestamp = timestamp;
            return newDailyVisits;
          }
          // console.log('Within day');
          transaction.update(Fire.shared.doc, {
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
          if (uid === Fire.shared.uid) {
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
          if (uid === Fire.shared.uid) {
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

      if (Settings.isCacheProfileUpdateActive) {
        const shouldUpdateKey = "@PillarValley/shouldUpdateProfile";
        const something = await getItemWithExpiration(shouldUpdateKey);
        if (!something) {
          const some = await setItemWithExpiration(
            shouldUpdateKey,
            { update: true },
            Settings.shouldDelayFirebaseProfileSyncInMinutes
          );
          dispatch.user.syncLocalToFirebase();
        } else {
          console.log("Prevent: syncLocalToFirebase");
        }
      } else {
        dispatch.user.syncLocalToFirebase();
      }
    },
    mergeDataWithFirebase: async (props) => {
      const doc = await firebase
        .firestore()
        .collection("players")
        .doc(Fire.shared.uid);
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
        .doc(Fire.shared.uid);
      const setWithMerge = doc.set(otherUserProps, { merge: true });
    },
    setGameData: (props) => {
      const { uid, doc } = Fire.shared;
      if (!uid) {
        // todo: add error
        return;
      }
      const setWithMerge = doc.set(props, { merge: true });
    },
  },
};

const FacebookLoginTypes = {
  Success: "success",
  Cancel: "cancel",
};

function deleteUserAsync(uid) {
  const db = firebase.firestore();

  return Promise.all([
    db.collection(Settings.slug).doc(uid).delete(),
    db.collection("players").doc(uid).delete(),
  ]);
}

export const facebook = {
  state: null,
  reducers: {
    set: (state, props) => props,
    setAuth: (state, props) => ({ ...(state || {}), auth: props }),
    setGraphResults: (state = {}, props) => {
      const { graph = {}, ...otherState } = state;
      return {
        ...otherState,
        graph: {
          ...graph,
          ...props,
        },
      };
    },
  },
  effects: {
    upgradeAccount: () => {
      dispatch.facebook.getToken(dispatch.facebook.upgradeAccountWithToken);
    },
    login: () => {
      dispatch.facebook.getToken(dispatch.facebook.loginToFirebaseWithToken);
    },
    getToken: async (callback) => {
      let auth;
      try {
        auth = await Facebook.logInWithReadPermissionsAsync(
          Constants.manifest.facebookAppId,
          Settings.facebookLoginProps
        );
      } catch ({ message }) {
        alert("Facebook Login Error:", message);
      }
      if (auth) {
        const { type, expires, token } = auth;
        if (type === FacebookLoginTypes.Success) {
          dispatch.facebook.set({ expires, token });
        } else if (type === FacebookLoginTypes.Cancel) {
          // do nothing, user cancelled
        } else {
          // unknown type, this should never happen
          alert("Failed to authenticate", type);
        }
        if (callback) callback(token);
      }
    },
    upgradeAccountWithToken: async (token, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "upgradeAccountWithToken: Can't upgrade account without a token"
        );
        return;
      }
      const _token = token || facebook.token;
      try {
        const user = await linkAndRetrieveDataWithToken(_token);
        console.log("upgradeAccountWithToken: Upgraded Successful");
        dispatch.facebook.authorized(user);
      } catch ({ message, code, ...error }) {
        if (code === "auth/credential-already-in-use") {
          // Delete current account while signed in
          // TODO: This wont work
          const uid = Fire.shared.uid;
          if (uid) {
            console.log("Should delete:", uid);
            await deleteUserAsync(uid);
            console.log("All deleted");
          } else {
            console.log("??? do something:", uid);
          }
          await dispatch.facebook.loginToFirebaseWithToken(_token);
        } else {
          // If the account is already linked this error will be thrown
          console.log("Error: upgradeAccountWithToken", message);
          console.log("error", code, error);
          Alert.alert(message);
        }
      }
    },
    loginToFirebaseWithToken: async (token, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "loginToFirebaseWithToken: Can't login to firebase without a token"
        );
        return;
      }
      const _token = token || facebook.token;
      try {
        const user = await signInWithToken(_token);
        dispatch.facebook.authorized(user);
      } catch ({ message }) {
        console.log("Error: loginToFirebase");
        Alert.alert(message);
      }
    },
    callGraphWithToken: async ({ token, params, callback }, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "callGraphWithToken: Can't call the Facebook graph API without a Facebook Auth token"
        );
        return;
      }
      const _token = token || facebook.token;

      const paramString = (params || ["id", "name", "email", "picture"]).join(
        ","
      );
      let results;
      try {
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${_token}&fields=${params.join(
            ","
          )}`
        );
        results = await response.json();
        dispatch.facebook.setGraphResults(results);
      } catch ({ message }) {
        console.log("Error: callGraphWithToken", message);
        alert(message);
      }
      if (callback) callback(results);
    },
    authorized: (user, {}) => {
      console.log("Authorized Facebook", user);
      // dispatch.facebook.setAuth(user);
      let _user = user;
      if (_user.toJSON) {
        _user = user.toJSON();
      }
      dispatch.user.update(_user);
    },
  },
};

function linkAndRetrieveDataWithToken(token) {
  const credential = firebase.auth.FacebookAuthProvider.credential(token);
  return firebase
    .auth()
    .currentUser.linkAndRetrieveDataWithCredential(credential);
}

function signInWithToken(token) {
  const credential = firebase.auth.FacebookAuthProvider.credential(token);
  return firebase.auth().signInAndRetrieveDataWithCredential(credential);
}

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
