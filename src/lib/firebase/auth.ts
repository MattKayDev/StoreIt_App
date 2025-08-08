import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signUp(email, password) {
  let result = null,
    error = null;
  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function signIn(email, password) {
  let result = null,
    error = null;
  try {
    result = await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function signInWithGoogle() {
  let result = null,
    error = null;
  try {
    await setPersistence(auth, browserLocalPersistence);
    result = await signInWithPopup(auth, googleProvider);
  } catch (e) {
    error = e;
  }
  return { result, error };
}

export async function resetPassword(email) {
    let result = null, error = null;
    try {
        result = await sendPasswordResetEmail(auth, email);
    } catch(e) {
        error = e;
    }
    return { result, error };
}

export async function logOut() {
    let result = null, error = null;
    try {
        result = await signOut(auth);
    } catch (e) {
        error = e;
    }

    return { result, error };
}
