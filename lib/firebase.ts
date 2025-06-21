import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)

// Connect to emulators only when explicitly enabled
if (process.env.USE_FIREBASE_EMULATORS === 'true') {
  if (!globalThis.__FIREBASE_EMULATORS_CONNECTED__) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectAuthEmulator(auth, 'http://localhost:9099')
      globalThis.__FIREBASE_EMULATORS_CONNECTED__ = true
      console.log('Connected to Firebase emulators')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // ESLint incorrectly flags this as unused - we're using it for logging and re-throwing
      console.error('Error connecting to Firebase emulators:', error)
      throw error
    }
  }
}

export default app

// Type augmentation for global Firebase emulator flag
declare global {
  var __FIREBASE_EMULATORS_CONNECTED__: boolean | undefined
} 