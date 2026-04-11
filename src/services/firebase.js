// src/services/firebase.js — Firebase SDK (compat mode)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBl8PRFr84XLNZNxfSg7LpVekjh5lvBWRI",
  authDomain: "flantzhk.github.io",
  projectId: "shadowspeak-22f04",
  storageBucket: "shadowspeak-22f04.firebasestorage.app",
  messagingSenderId: "332784610142",
  appId: "1:332784610142:web:0dfaf945993e735ef03dcf"
};

if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);

const fbAuth = firebase.auth();
const fbDb = firebase.firestore();

fbDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') console.warn("Firestore persistence: multiple tabs open");
  else if (err.code === 'unimplemented') console.warn("Firestore persistence: not supported in this browser");
});

export { firebase, fbAuth, fbDb };
export default firebase;
