const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');
import { Constants } from 'expo';
import Secret from './Secret';
import { dispatch } from '@rematch/core';
import Settings from '../constants/Settings';

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

  upgradeAccount = async () => {
    dispatch.facebook.upgradeAccount();
  };

  uploadImageAsync = uri => {
    return new Promise(async (res, rej) => {
      //todo: meta data is cool
      var metadata = {
        contentType: 'image/jpeg',
      };

      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = firebase
        .storage()
        .ref(`${this.uid}/images`)
        .child(uuid.v4() + '.jpg');

      const uploadTask = ref.put(blob, metadata);

      uploadTask.on(
        'state_changed',
        snapshot => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        },
        rej,
        function() {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          res(uploadTask.snapshot.ref.getDownloadURL());
        },
      );
    });
  };

  submitComplaint = (targetUid, complaint) => {
    this.db.collection('complaints').add({
      slug: Constants.manifest.slug,
      uid: this.uid,
      targetUid: uid,
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
