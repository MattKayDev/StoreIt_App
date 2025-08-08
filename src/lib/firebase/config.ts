import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "inventrack-2hiqb",
  appId: "1:59110427809:web:586df6d05ea16fbc2634e0",
  storageBucket: "inventrack-2hiqb.appspot.com",
  apiKey: "AIzaSyBtPwxAthwwA_EEKlh8kGDQ81ja6MTEotI",
  authDomain: "inventrack-2hiqb.firebaseapp.com",
  messagingSenderId: "59110427809",
  databaseURL: "https://inventrack-2hiqb-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
