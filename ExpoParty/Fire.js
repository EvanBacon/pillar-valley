const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

import Secret from './Secret';
import getUserInfo from './utils/getUserInfo';
import getSlug from './utils/getSlug';

const collectionName = 'test-' + getSlug(); //users

class Fire {
  constructor() {
    this.init();
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
    }
  };

  compareDaily = async () => {
    const dailyVisits = await this.incrementDailyReward();
    if (dailyVisits != this.userData.dailyVisits) {
      console.log('Yay! You came back, your streak is now at: ' + dailyVisits);
      this.userData.dailyVisits = dailyVisits;
      /// Give reward!
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

            const hours = Math.abs(lastRewardTimestamp - timestamp) / 36e5;

            if (hours >= 24) {
              if (hours >= 48) {
                // It has been more than 1 day since the last visit - break the streak
                const newDailyVisits = 0;
                transaction.update(this.doc, {
                  dailyVisits: newDailyVisits,
                  lastRewardTimestamp: timestamp,
                });
                this.user.lastRewardTimestamp = timestamp;
                return newDailyVisits;
              } else {
                // Perfect! It has been 1 day since the last visit - increment streak and save current time

                const dailyVisits = data.dailyVisits || 0;
                const newDailyVisits = dailyVisits + 1;
                transaction.update(this.doc, {
                  dailyVisits: newDailyVisits,
                  lastRewardTimestamp: timestamp,
                });
                this.user.lastRewardTimestamp = timestamp;
                return newDailyVisits;
              }
            } else {
              // It hasn't been a day yet - do nothing
            }
            return data.dailyVisits || 0;
          });
        })
        .then(res)
        .catch(rej);
    });
  };

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

  getUser = async () => {
    try {
      this.userData = await this.doc.get();
    } catch (error) {
      console.warn(error);
    }
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
    const setWithMerge = this.doc.set({ uid, ...info }, { merge: true });
  };

  saveScore = score => {
    this.saveUserInfo({
      timestamp: new Date().getTime(),
      score,
    });
  };

  getPagedScore = async ({ size, start }) => {
    const slug = getSlug();

    let ref = this.collection
      .where('slug', '==', slug)
      .orderBy('score', 'desc')
      .limit(size);
    try {
      if (start) {
        ref = ref.startAfter(start);
      }

      const querySnapshot = await ref.get();
      const data = [];
      querySnapshot.forEach(function(doc) {
        const _data = doc.data();
        data.push({ key: doc.id, ..._data, title: _data.deviceName });
      });
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { data, cursor: lastVisible };
    } catch (error) {
      console.error('Error getting documents: ', error);
    }
  };

  get db() {
    return firebase.firestore();
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }
  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
}

Fire.shared = new Fire();
export default Fire;
