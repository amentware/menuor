
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYhi4sXp0tQ6MclvOh0QUWySyJ2AlOoxM",
  authDomain: "themenuor.firebaseapp.com",
  projectId: "themenuor",
  storageBucket: "themenuor.firebasestorage.app",
  messagingSenderId: "659788051974",
  appId: "1:659788051974:web:10ca18ca9a939a20367587",
  measurementId: "G-5YL45WSQEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;

// Only initialize analytics in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
};

// Export the User type correctly using 'export type'
export type { User };
