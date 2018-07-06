const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

import Secret from './Secret';
import getUserInfo from './utils/getUserInfo';
import getSlug from './utils/getSlug';
import { dispatch } from '@rematch/core';

const collectionName = getSlug();

import Settings from '../constants/Settings';
class Fire {
  constructor() {
    if (!Settings.isFirebaseEnabled) {
      return;
    }

    this.init();
    firebase.firestore().settings({ timestampsInSnapshots: true });
    this.observeAuth();
  }

  init = () => firebase.initializeApp(Secret);

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = async user => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    } else {
      await this.getUser();
      this.saveUser();
      this.compareDaily();
      console.log('signed in');
    }
  };

  getUser = () => {
    return new Promise((res, rej) => {
      this.doc
        .get()
        .then(doc => {
          if (!doc.exists) {
            console.log('No such document!');
          } else {
            console.log('Document data:', doc.data());
            this.userData = doc.data();
            this.userData.name =
              this.userData.name ||
              this.userData.title ||
              this.userData.deviceName;
            dispatch.user.update(this.userData);
          }
          res();
        })
        .catch(rej);
    });
  };

  compareDaily = async () => {
    const dailyVisits = await this.incrementDailyReward();

    if (dailyVisits != this.userData.dailyVisits) {
      // console.log('Yay! You came back, your streak is now at: ' + dailyVisits);

      dispatch.dailyStreak.assign(dailyVisits);
      if (dailyVisits > this.userData.dailyVisits) {
        dispatch.dailyStreak.rewardUser(dailyVisits);
      }
      this.userData.dailyVisits = dailyVisits;
      /// Give reward!
    } else {
      // console.log('ummmm', dailyVisits);
    }
  };

  incrementDailyReward = async () => {
    const timestamp = new Date().getTime();
    return new Promise((res, rej) => {
      this.db
        .runTransaction(transaction => {
          return transaction.get(this.doc).then(userDoc => {
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
                transaction.update(this.doc, {
                  dailyVisits: newDailyVisits,
                  lastRewardTimestamp: timestamp,
                });
                this.userData.lastRewardTimestamp = timestamp;
                return newDailyVisits;
              } else {
                // console.log('You were here yesterday');
                // Perfect! It has been 1 day since the last visit - increment streak and save current time

                const dailyVisits = data.dailyVisits || 0;
                const newDailyVisits = dailyVisits + 1;
                transaction.update(this.doc, {
                  dailyVisits: newDailyVisits,
                  lastRewardTimestamp: timestamp,
                });
                this.userData.lastRewardTimestamp = timestamp;
                return newDailyVisits;
              }
            } else {
              // console.log('Within day');
              transaction.update(this.doc, {
                dailyVisits: data.dailyVisits || 0,
                lastRewardTimestamp:
                  data.lastRewardTimestamp || new Date().getTime(),
              });

              // It hasn't been a day yet - do nothing
            }
            return data.dailyVisits || 0;
          });
        })
        .then(res)
        .catch(rej);
    });
  };

  saveUser = () => {
    const user = getUserInfo();
    this.saveUserInfo(user);
  };

  saveUserInfo = info => {
    const { uid } = this;
    if (!uid) {
      return;
    }
    // console.log('saveUserInfo', uid, info);
    const ref = this.doc;
    const setWithMerge = ref.set({ uid, ...info }, { merge: true });
  };

  saveScore = score => {
    this.saveUserInfo({
      timestamp: new Date().getTime(),
      score,
    });
  };

  debugPagedScore = true;
  getPagedScore = async ({ size, start }) => {
    if (this.debugPagedScore) {
      return {
        data: [
          {
            key: 'gUdfd7VmKyWHR84G3tvB9NkYH0b2',
            appOwnership: 'expo',
            dailyVisits: 0,
            deviceId: 'F56CB29A-581A-4517-B3C8-3BDA0D2A5E3B',
            deviceName: " Evan's iPhone 7 Plus",
            deviceYearClass: 2016,
            expoVersion: '2.5.0.1014340',
            isDevice: true,
            lastRewardTimestamp: 1524166289798,
            platform: {
              ios: {
                buildNumber: '2.5.0.1014340',
                model: 'iPhone 7 Plus',
                platform: 'iPhone9,4',
                systemVersion: '11.2.6',
                userInterfaceIdiom: 'handset',
              },
            },
            score: 3,
            slug: 'crossy-road',
            uid: 'gUdfd7VmKyWHR84G3tvB9NkYH0b2',
            title: " Evan's iPhone 7 Plus",
          },
          {
            key: '0oK50HoGt6PqXG1ApBTroS3IxR23',
            appOwnership: 'expo',
            dailyVisits: 0,
            deviceId: 'CDF20BAA-6D0A-4653-8719-CD20006580F7',
            deviceName: 'Expo iPhone X',
            deviceYearClass: 2017,
            expoVersion: '2.6.5',
            isDevice: true,
            lastRewardTimestamp: 1530854594628,
            platform: {
              ios: {
                buildNumber: '2.6.5',
                model: 'iPhone X',
                platform: 'iPhone10,6',
                systemVersion: '11.3.1',
                userInterfaceIdiom: 'handset',
              },
            },
            score: 2,
            slug: 'crossy-road',
            uid: '0oK50HoGt6PqXG1ApBTroS3IxR23',
            title: 'Expo iPhone X',
          },
          {
            key: 'R2XBuw9im3QBtpU6YYck2tdhpEI3',
            appOwnership: 'expo',
            dailyVisits: 0,
            deviceId: '9E917464-CF47-417B-AA41-07E52190F26A',
            deviceName: 'Expo iPhone X',
            deviceYearClass: 2017,
            expoVersion: '2.4.7.1013849',
            isDevice: true,
            lastRewardTimestamp: 1524197897114,
            platform: {
              ios: {
                buildNumber: '2.4.7.1013849',
                model: 'iPhone X',
                platform: 'iPhone10,6',
                systemVersion: '11.0.1',
                userInterfaceIdiom: 'handset',
              },
            },
            score: 1,
            slug: 'crossy-road',
            uid: 'R2XBuw9im3QBtpU6YYck2tdhpEI3',
            title: 'Expo iPhone X',
          },
        ],
      };
    } else {
      let ref = this.collection.orderBy('score', 'desc').limit(size);
      try {
        if (start) {
          ref = ref.startAfter(start);
        }
        const querySnapshot = await ref.get();

        const data = [];
        querySnapshot.forEach(function(doc) {
          if (!doc.exists) {
            console.log("Fire.getPagedScore(): Error: data doesn't exist", {
              size,
              start,
              collectionName,
            });
          } else {
            const _data = doc.data();
            data.push({ key: doc.id, ..._data, title: _data.deviceName });
          }
        });
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        return { data, cursor: lastVisible };
      } catch (error) {
        console.error('Error getting documents: ', error);
      }
      return {};
    }
  };

  /*
    negative values are also accepted... Use this for spending and for updating after a game.
  */
  addCurrency = amount => {
    return new Promise((res, rej) => {
      this.db
        .runTransaction(transaction => {
          return transaction.get(this.doc).then(userDoc => {
            if (!userDoc.exists) {
              throw 'Document does not exist!';
            }

            const data = userDoc.data();
            const currency = data.currency || 0;
            const newCurrency = currency + amount;
            transaction.update(this.doc, { currency: newCurrency });
            this.user.currency = newCurrency;
            return newCurrency;
          });
        })
        .then(res)
        .catch(rej);
    });
  };

  get collection() {
    return this.db.collection(collectionName);
  }

  get doc() {
    return this.collection.doc(this.uid);
  }

  get db() {
    return firebase.firestore();
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get timestamp() {
    return Date.now();
  }
}

Fire.shared = new Fire();
export default Fire;
