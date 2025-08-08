
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  updatePassword,
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

export async function updateUserProfile(profileData: { displayName?: string; photoURL?: string | null }) {
    let result = null, error = null;
    if (!auth.currentUser) {
        return { result, error: { message: "No user logged in." } };
    }
    try {
        await updateProfile(auth.currentUser, {
            displayName: profileData.displayName,
            photoURL: profileData.photoURL
        });
        result = auth.currentUser;
    } catch(e) {
        error = e;
    }
    return { result, error };
}


export async function updateUserPassword(newPassword: string) {
    let result = null, error = null;
    if (!auth.currentUser) {
        return { result, error: { message: "No user logged in." } };
    }
    try {
        await updatePassword(auth.currentUser, newPassword);
        result = true;
    } catch(e) {
        error = e;
    }
    return { result, error };
}

    