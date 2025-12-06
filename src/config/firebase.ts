import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAsOkziuS2XRQ3FifxPeRFbwDnsRgM4RF0",
  authDomain: "cira-db.firebaseapp.com",
  projectId: "cira-db",
  storageBucket: "cira-db.firebasestorage.app",
  messagingSenderId: "388474554775",
  appId: "1:388474554775:web:f6751b24b70412e4619cd2",
  measurementId: "G-Q8P7S0M855"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
