import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Browser-only Firebase client (singleton).
 *
 * The web config is public by design; access is controlled by `firestore.rules`.
 * Values are read at build time from NEXT_PUBLIC_FIREBASE_* (see .env.example).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let db: Firestore | null = null;

export function getDb(): Firestore {
  if (db) return db;
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* environment variables.");
  }
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  return db;
}
