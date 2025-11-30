import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAgZV5W_AauAn8X7r7kOjtIcjUSj0g_ISw",
  authDomain: "arta-a6d0f.firebaseapp.com",
  projectId: "arta-a6d0f",
  storageBucket: "arta-a6d0f.firebasestorage.app",
  messagingSenderId: "714515987128",
  appId: "1:714515987128:web:264b4a9f4c807a834d124d",
  measurementId: "G-RXZRSWQ14B"
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
