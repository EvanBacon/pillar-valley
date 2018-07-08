import { Constants, Facebook } from 'expo';
import { dispatch } from '@rematch/core'; // 0.1.0-beta.8
import Expo from 'expo';
import { Dimensions, AsyncStorage } from 'react-native';
import Fire from '../ExpoParty/Fire';
import Settings from '../constants/Settings';
import getDeviceInfo from '../ExpoParty/utils/getUserInfo';
import firebase from 'firebase';
import GameStates from '../Game/GameStates';
import getSlug from '../ExpoParty/utils/getSlug';

export const score = {
  state: { current: 0, best: 0, last: null, isBest: false },
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
    _reset: state => {
      return {
        ...state,
        current: 0,
        last: state.current,
        isBest: false,
      };
    },
  },
  effects: {
    reset: (props, { score }) => {
      if (Settings.isFirebaseEnabled) {
        console.log('reset', score.isBest, score.current);
        if (Settings.isEveryScoreBest) {
          console.log('fkit', score.current);
          dispatch.score.setHighScore(score.current);
        } else if (score.isBest) {
          dispatch.score.setHighScore(score.best);
        }
      }
      dispatch.score._reset();
    },
    setHighScore: async (highScore, { user: { displayName, photoURL } }) => {
      console.log('set High score', highScore);

      const docRef = Fire.shared.doc;
      try {
        await Fire.shared.db.runTransaction(transaction => {
          return transaction.get(docRef).then(doc => {
            if (!doc.exists) {
              throw 'Document does not exist!';
            }

            const data = doc.data();
            const cloudHighScore = data.score || 0;
            console.log('cloud score', cloudHighScore);
            if (Settings.isEveryScoreBest || highScore > cloudHighScore) {
              console.log('truly best', highScore);
              transaction.update(docRef, {
                score: highScore,
                timestamp: Date.now(),
                displayName,
                photoURL,
              });
            } else {
              transaction.update(docRef, {
                ...data,
                displayName,
                photoURL,
              });
              dispatch.score.setBest(cloudHighScore);
            }
          });
        });
        console.log('Successfully wrote score');
      } catch ({ message }) {
        console.log('Failed to write score', message);
        alert(message);
      }
    },
  },
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
    toggle: state => !state,
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
      const { width, height } = Dimensions.get('window');
      const options = {
        format: 'jpg',
        quality: 0.3,
        result: 'file',
        height,
        width,
      };
      const uri = await Expo.takeSnapshotAsync(ref, options);
      dispatch.screenshot.update(uri);
    },
  },
};

async function incrementDailyReward() {
  const timestamp = Date.now();
  return new Promise((res, rej) => {
    Fire.shared.db
      .runTransaction(transaction => {
        return transaction.get(Fire.shared.doc).then(userDoc => {
          if (!userDoc.exists) {
            throw 'Document does not exist!';
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
              /// TODO:EVAN: save timestamp
              // this.userData.lastRewardTimestamp = timestamp;
              return newDailyVisits;
            } else {
              // console.log('You were here yesterday');
              // Perfect! It has been 1 day since the last visit - increment streak and save current time

              const dailyVisits = data.dailyVisits || 0;
              const newDailyVisits = dailyVisits + 1;
              transaction.update(Fire.shared.doc, {
                dailyVisits: newDailyVisits,
                lastRewardTimestamp: timestamp,
              });
              /// TODO:EVAN: save timestamp
              // this.userData.lastRewardTimestamp = timestamp;
              return newDailyVisits;
            }
          } else {
            // console.log('Within day');
            transaction.update(Fire.shared.doc, {
              dailyVisits: data.dailyVisits || 0,
              lastRewardTimestamp: data.lastRewardTimestamp || Date.now(),
            });

            // It hasn't been a day yet - do nothing
          }
          return data.dailyVisits || 0;
        });
      })
      .then(res)
      .catch(rej);
  });
}

export const dailyStreak = {
  state: 0,
  reducers: {
    increment: s => s + 1,
    set: (s, props) => props,
    reset: () => 0,
  },
  effects: {
    rewardUser: async streak => {
      console.log('award', streak);
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
        /// Give reward!
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

export const leaders = {
  state: {},
  reducers: {
    batchUpdate: (state, users) => {
      let nextData = state;
      for (let user of users) {
        nextData = mergeInternal(nextData, user);
      }
      return nextData;
    },
    update: (state, { uid, user }) => {
      return mergeInternal(state, { uid, user });
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
    getPagedAsync: async ({ start, size, callback }) => {
      const collection = firebase.firestore().collection(getSlug());

      let ref = collection.orderBy('score', 'desc').limit(size);
      try {
        if (start) {
          ref = ref.startAfter(start);
        }
        const querySnapshot = await ref.get();

        const data = [];
        querySnapshot.forEach(function(doc) {
          if (!doc.exists) {
            console.log("leaders.getPagedAsync(): Error: data doesn't exist", {
              size,
              start,
              collectionName,
            });
          } else {
            const _data = doc.data();
            const uid = doc.id;
            data.push({ uid, user: { key: uid, uid, ..._data } });
          }
        });

        dispatch.leaders.batchUpdate(data);
        const cursor = querySnapshot.docs[querySnapshot.docs.length - 1];
        callback && callback({ data, cursor, noMore: data.length < size });
        return;
      } catch (error) {
        console.error('Error getting documents: ', error);
      }
      callback && callback({});
    },
    getAsync: async ({ uid, callback }) => {
      try {
        const ref = firebase
          .firestore()
          .collection(getSlug())
          .doc(uid);
        const doc = await ref.get();
        if (!doc.exists) {
          if (uid === Fire.shared.uid) {
            const currentUser = firebase.auth().currentUser || {};
            ref.set({
              rank: 999999,
              displayName:
                currentUser.displayName ||
                Constants.deviceName ||
                'Pillar the Kid',
              photoURL: currentUser.photoURL,
              score: 0,
              timestamp: Date.now(),
            });
          }
          console.log('No document: leaders/' + uid);
        } else {
          const user = doc.data();
          console.log('got leader', user);
          dispatch.leaders.update({ uid, user });
          callback && callback(user);
        }
      } catch ({ message }) {
        console.log('Error: leaders.get', message);
        alert(message);
      }
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
      try {
        const ref = firebase
          .firestore()
          .collection('players')
          .doc(uid);
        const doc = await ref.get();
        if (!doc.exists) {
          if (uid === Fire.shared.uid) {
            const currentUser = firebase.auth().currentUser || {};
            const user = {
              rank: 999999,
              displayName:
                currentUser.displayName ||
                Constants.deviceName ||
                'Mark Pillar',
              photoURL: currentUser.photoURL,
              score: 0,
              timestamp: Date.now(),
            };
            ref.add(user);
            callback && callback(user);
          }
          console.log('No document: players/' + uid);
          callback && callback({});
        } else {
          const user = doc.data();
          console.log('got player', user);
          dispatch.players.update({ uid, user });
          callback && callback(user);
        }
      } catch ({ message }) {
        console.log('Error: players.get', message);
        alert(message);
      }
    },
  },
};

function reduceFirebaseUser(user) {
  let nextUser = user;
  let possibleUpdates = {};

  if (user.providerData && user.providerData.length > 0) {
    let facebookData = user.providerData[0];
    nextUser['fbuid'] = facebookData.uid;
    let keysToCheck = ['displayName', 'photoURL'];
    for (let key of keysToCheck) {
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
    photoURL,
    phoneNumber,
    lastLoginAt,
    isAnonymous,
    fbuid,
    displayName,
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
    signInAnonymously: () => {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        console.log('Error: signInAnonymously', message);
        alert(message);
      }
    },
    observeAuth: (props, state) => {
      firebase.auth().onAuthStateChanged(user => {
        if (!user) {
          // TODO: Evan: Y tho...
          dispatch.user.clear();
          dispatch.user.signInAnonymously();
        } else {
          dispatch.user.getAsync();
          dispatch.leaders.getAsync({ uid: user.uid });
        }
      });
    },
    maybeSyncUserWithFirebase: (currentUserProps, { user }) => {
      if (JSON.stringify(currentUserProps) !== JSON.stringify(user)) {
        console.log('REMATCH: new user data', currentUserProps);
        console.log('REMATCH: current user data', user);
        // Fire.shared.saveUser;
      }
    },
    getAsync: async (props, { user: localUserData }) => {
      let combinedUserData = {};
      let firebaseAuthData = firebase.auth().currentUser.toJSON();

      if (firebaseAuthData == null) {
        console.warn(
          "models: Shouldn't call user.getAsync until the user is authed",
        );
        return;
      }
      const nextFirebaseAuthData = reduceFirebaseUser(firebaseAuthData);
      const deviceInfo = getDeviceInfo();

      combinedUserData = {
        ...deviceInfo,
        ...nextFirebaseAuthData,
      };

      let updates = {};
      for (let key of Object.keys(combinedUserData)) {
        if (
          combinedUserData[key] != undefined &&
          combinedUserData[key] !== localUserData[key]
        ) {
          updates[key] = combinedUserData[key];
        }
      }
      console.log({ updates });
      if (Object.keys(updates).length > 0) {
        dispatch.user.update(updates);
      }
      dispatch.dailyStreak.compareDaily();
      dispatch.players.update({
        uid: combinedUserData.uid,
        user: combinedUserData,
      });

      if (Settings.isCacheProfileUpdateActive) {
        const shouldUpdateKey = '@PillarValley/shouldUpdateProfile';
        const something = await getItemWithExpiration(shouldUpdateKey);
        if (!something) {
          const some = await setItemWithExpiration(
            shouldUpdateKey,
            { update: true },
            Settings.shouldDelayFirebaseProfileSyncInMinutes,
          );
          dispatch.user.syncLocalToFirebase();
        } else {
          console.log('Prevent: syncLocalToFirebase');
        }
      } else {
        dispatch.user.syncLocalToFirebase();
      }
    },
    mergeDataWithFirebase: async props => {
      const doc = await firebase
        .firestore()
        .collection('players')
        .doc(Fire.shared.uid);
      const setWithMerge = doc.set(props, { merge: true });
    },
    syncLocalToFirebase: async (props, { user }) => {
      console.log('syncLocalToFirebase');
      const doc = await firebase
        .firestore()
        .collection('players')
        .doc(Fire.shared.uid);
      const setWithMerge = doc.set(user, { merge: true });
    },
    setGameData: props => {
      const { uid, doc } = Fire.shared;
      if (!uid) {
        //todo: add error
        return;
      }
      const setWithMerge = doc.set(props, { merge: true });
    },
  },
};

const FacebookLoginTypes = {
  Success: 'success',
  Cancel: 'cancel',
};

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
    getToken: async callback => {
      let auth;
      try {
        auth = await Facebook.logInWithReadPermissionsAsync(
          Constants.manifest.facebookAppId,
          Settings.facebookLoginProps,
        );
      } catch ({ message }) {
        alert('Facebook Login Error:', message);
      }
      if (auth) {
        const { type, expires, token } = auth;
        if (type === FacebookLoginTypes.Success) {
          dispatch.facebook.set({ expires, token });
        } else if (type === FacebookLoginTypes.Cancel) {
          // do nothing, user cancelled
        } else {
          // unknown type, this should never happen
          alert('Failed to authenticate', type);
        }
        callback && callback(token);
      }
    },
    upgradeAccountWithToken: async (token, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "upgradeAccountWithToken: Can't upgrade account without a token",
        );
        return;
      }
      const _token = token || facebook.token;
      try {
        const user = await linkAndRetrieveDataWithToken(_token);
        console.log('upgradeAccountWithToken: Upgraded Successful');
        dispatch.facebook.authorized(user);
      } catch ({ message }) {
        // If the account is already linked this error will be thrown
        console.log('Error: upgradeAccountWithToken', message);
        dispatch.facebook.loginToFirebase();
      }
    },
    loginToFirebaseWithToken: async (token, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "loginToFirebaseWithToken: Can't login to firebase without a token",
        );
        return;
      }
      const _token = token || facebook.token;
      try {
        const user = await signInWithToken(_token);
        dispatch.facebook.authorized(user);
      } catch ({ message }) {
        console.log('Error: loginToFirebase');
        alert(message);
      }
    },
    callGraphWithToken: async ({ token, params, callback }, { facebook }) => {
      if (!token && (!facebook || !facebook.token)) {
        console.warn(
          "callGraphWithToken: Can't call the Facebook graph API without a Facebook Auth token",
        );
        return;
      }
      const _token = token || facebook.token;

      const paramString = (params || ['id', 'name', 'email', 'picture']).join(
        ',',
      );
      let results;
      try {
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${_token}&fields=${params.join(
            ',',
          )}`,
        );
        results = await response.json();
        dispatch.facebook.setGraphResults(results);
      } catch ({ message }) {
        console.log('Error: callGraphWithToken', message);
        alert(message);
      }
      callback && callback(results);
    },
    authorized: (user, {}) => {
      console.log('Authorized Facebook', user);
      // dispatch.facebook.setAuth(user);
      dispatch.user.update(user);
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
  return firebase.auth().signInWithCredential(credential);
}

/**
 *
 * @param urlAsKey
 * @param expireInMinutes
 * @returns {Promise.<*>}
 */

async function setItemWithExpiration(key, value, minutes) {
  //set expire at
  value = { value, expireAt: getExpireDate(minutes) };
  //stringify object
  const objectToStore = JSON.stringify(value);
  //store object
  return AsyncStorage.setItem(key, objectToStore);
}

async function getItemWithExpiration(urlAsKey) {
  let data;
  await AsyncStorage.getItem(urlAsKey, async (err, value) => {
    data = JSON.parse(value);

    // there is data in cache && cache is expired
    if (
      data !== null &&
      data['expireAt'] &&
      new Date(data.expireAt) < new Date()
    ) {
      //clear cache
      AsyncStorage.removeItem(urlAsKey);

      //update res to be null
      data = null;
    } else {
      console.log('read data from cache  ');
    }
  });
  if (data) {
    return data.value;
  }
}

function getExpireDate(expireInMinutes) {
  const now = new Date();
  let expireTime = new Date(now);
  expireTime.setMinutes(now.getMinutes() + expireInMinutes);
  return expireTime;
}
