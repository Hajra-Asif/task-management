import firebaseConfig from "./config.js";
// initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

// authentication
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// firestore
import {
  getFirestore,
  doc,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  limit,
  startAfter,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";




// variables
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);


// export variables
export {
    app,
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signOut,
    signInWithPopup,
    sendPasswordResetEmail,
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    onSnapshot,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    orderBy,
    deleteDoc,
    updateDoc,
    limit,
    startAfter,
    db,

  };