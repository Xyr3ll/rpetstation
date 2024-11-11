import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export { app, analytics };
