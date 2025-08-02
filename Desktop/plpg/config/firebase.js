import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Firebase configuration - using environment variables for security
export const appId = typeof __app_id !== 'undefined' ? __app_id : import.meta.env.VITE_APP_ID || 'plpg-67599';
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAw5kjeOm9ov9uabUhkr92c642_6Uhl6Nc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "plpg-67599.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "plpg-67599",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "plpg-67599.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1001499672106",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1001499672106:web:14764b7f3d898ef1274d53",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HSYYGYXHP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to fix connection errors
// This resolves ERR_QUIC_PROTOCOL_ERROR and ERR_ABORTED issues
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

export default app;