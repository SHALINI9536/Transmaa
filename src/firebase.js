import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  signOut
} from "firebase/auth";
import { getDatabase, ref, set, get, update, onValue, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBKOx5AhzDDc193AhbShrJaGbeeLH4RwiY",
  authDomain: "transma-bcf73.firebaseapp.com",
  databaseURL: "https://transma-bcf73-default-rtdb.firebaseio.com",
  projectId: "transma-bcf73",
  storageBucket: "transma-bcf73.firebasestorage.app",
  messagingSenderId: "80808256152",
  appId: "1:80808256152:web:bc6dc853dc9bf7441c26ed",
  measurementId: "G-VFJVRRWZ7R"
};

const app = initializeApp(firebaseConfig);

let analytics = null;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  signOut,
  ref,
  set,
  get,
  update,
  onValue,
  push
};
