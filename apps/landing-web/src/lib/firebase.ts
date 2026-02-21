// TITANIUM CONFIG: Centralized Firebase Config Proxy
// Redirects to the SINGLE source of truth in the monorepo engine.
// ARCH-002 FIX: Use shared engine-auth to prevent double Firebase initialization.
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (landing-web only needs functions, no auth/db)
const app = initializeApp(firebaseConfig);

// Initialize Cloud Functions (Region: europe-west1)
export const functions = getFunctions(app, 'europe-west1');
