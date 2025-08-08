import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "inventrack-2hiqb",
  appId: "1:59110427809:web:586df6d05ea16fbc2634e0",
  storageBucket: "inventrack-2hiqb.firebasestorage.app",
  apiKey: "AIzaSyBtPwxAthwwA_EEKlh8kGDQ81ja6MTEotI",
  authDomain: "inventrack-2hiqb.firebaseapp.com",
  messagingSenderId: "59110427809"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
