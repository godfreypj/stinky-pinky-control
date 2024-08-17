
// firebase.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stinky-pinky-db.firebaseio.com"
});

const db = admin.firestore();

export { admin, db, functions };
