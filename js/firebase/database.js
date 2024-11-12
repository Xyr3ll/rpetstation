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
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; // Add orderBy

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp7z9WDnT2w2aSmS4cmZ4WrEKkRlVYQOc",
  authDomain: "rpetstation-2688f.firebaseapp.com",
  projectId: "rpetstation-2688f",
  storageBucket: "rpetstation-2688f.firebasestorage.app",
  messagingSenderId: "636775663420",
  appId: "1:636775663420:web:ce5592e031e97a462cc039",
  measurementId: "G-3HP8CPT4PG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
};
