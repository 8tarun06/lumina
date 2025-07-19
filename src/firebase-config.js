// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ THIS LINE IS MISSING
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✅ Add this line
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";




// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzFklZSjcePpHdVRFS9XYvuS4TGgNRVt4",
  authDomain: "p-lumina.firebaseapp.com",
  projectId: "p-lumina",
  storageBucket: "p-lumina.firebasestorage.app",
  messagingSenderId: "48573648830",
  appId: "1:48573648830:web:eff5047cb60e8d29fef3ef",
  measurementId: "G-K49GGE9H2G"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
const storage = getStorage(app); // ✅ Initialize storage
export const provider = new GoogleAuthProvider();


export { storage }; // ✅ Export storage

