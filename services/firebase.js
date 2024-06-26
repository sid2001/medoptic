const admin = require('firebase-admin');
const serviceAccount = require('../firebase.json')// Make sure to use the correct path to your service account key file
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  storageBucket:process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const bucket = admin.storage().bucket('profile-images');

module.exports = { admin, db, bucket };
