// Import necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6j42N1eGpD-xD7Iun7_ycs__C3VgID64",
  authDomain: "pares-428cb.firebaseapp.com",
  projectId: "pares-428cb",
  storageBucket: "pares-428cb.appspot.com",
  messagingSenderId: "517245014089",
  appId: "1:517245014089:web:725ba599de3323c88a2f98",
  measurementId: "G-1QGC98G4RZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the app, db, and necessary Firestore functions
export {
  app,
  db,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
  uploadBytesResumable,
  getFirestore,
  deleteDoc,
  serverTimestamp 
};
