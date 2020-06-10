// @flow
import { dispatch } from "../rematch/store";
import Constants from "expo-constants";
import Settings from "../constants/Settings";
import Secret from "./Secret";

import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";

const collectionName = Settings.slug;

class Fire {
  constructor() {}

  init = () => {
    if (!Settings.isFirebaseEnabled) {
      return;
    }

    firebase.initializeApp(Secret);
    firebase.firestore().settings({ timestampsInSnapshots: true });
    dispatch.user.observeAuth();

    // DEBUG
    if (!Settings.debug) {
      dispatch.leaders.clear();
    }

    // dispatch.players.clear();
    // dispatch.user.clear();
  };

  /*
    negative values are also accepted... Use this for spending and for updating after a game.
  */
  addCurrency = (amount) =>
    new Promise((res, rej) => {
      this.db
        .runTransaction((transaction) =>
          transaction.get(this.doc).then((userDoc) => {
            if (!userDoc.exists) {
              throw "Document does not exist!";
            }

            const data = userDoc.data();
            const currency = data.currency || 0;
            const newCurrency = currency + amount;
            transaction.update(this.doc, { currency: newCurrency });
            this.user.currency = newCurrency;
            return newCurrency;
          })
        )
        .then(res)
        .catch(rej);
    });

  upgradeAccount = async () => {
    dispatch.facebook.upgradeAccount();
  };

  submitComplaint = (targetUid, complaint) => {
    this.db.collection("complaints").add({
      slug: Constants.manifest.slug,
      uid: this.uid,
      targetUid,
      complaint,
      timestamp: this.timestamp,
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

  get isAuthed() {
    return !!this.uid;
  }
}

Fire.shared = new Fire();
export default Fire;
