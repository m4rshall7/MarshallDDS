import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDenrwFITWdOJWvJrhZA2ta5ejh4Z75-4M",
  authDomain: "cashflow-dds.firebaseapp.com",
  projectId: "cashflow-dds",
  storageBucket: "cashflow-dds.firebasestorage.app",
  messagingSenderId: "232948262158",
  appId: "1:232948262158:web:9c22f647dea9f5d2a6235f",
  measurementId: "G-EPEWVYEFRQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
