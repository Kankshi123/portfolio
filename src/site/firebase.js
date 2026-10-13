import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'

const FIREBASE_CONFIG_KEY = 'portfolio_firebase_config_v1'
const COLLECTION_NAME = 'portfolio_cms'
const DOC_ID = 'live_content'

// Project's live Firebase configuration
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBzHulU6y3UKKk5OpgWLHEKezGMbfmYlfc",
  authDomain: "flashlite-photography.firebaseapp.com",
  projectId: "flashlite-photography",
  storageBucket: "flashlite-photography.firebasestorage.app",
  messagingSenderId: "574386055153",
  appId: "1:574386055153:web:3e733ffdfb2c975ae04650",
  measurementId: "G-QE62V7DC12"
}

// Load saved custom config or default to built-in project config
export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e)
  }

  // Fallback to environment variables if provided
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return DEFAULT_FIREBASE_CONFIG
}

export function saveStoredFirebaseConfig(config) {
  try {
    if (!config) {
      localStorage.removeItem(FIREBASE_CONFIG_KEY)
    } else {
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config))
    }
  } catch (e) {
    console.error('Failed to save Firebase config:', e)
  }
}

let firestoreInstance = null

export function getDb() {
  if (firestoreInstance) return firestoreInstance

  const config = getStoredFirebaseConfig()
  if (!config || !config.apiKey || !config.projectId) {
    return null
  }

  try {
    const app = getApps().length ? getApp() : initializeApp(config)
    firestoreInstance = getFirestore(app)
    return firestoreInstance
  } catch (err) {
    console.error('Firebase initialization error:', err)
    return null
  }
}

// Reset instance when config changes
export function reinitFirebase(newConfig) {
  saveStoredFirebaseConfig(newConfig)
  firestoreInstance = null
  return getDb()
}

// Push latest portfolio content to cloud Firestore
export async function pushContentToCloud(contentData) {
  const db = getDb()
  if (!db) return false

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID)
    await setDoc(docRef, {
      ...contentData,
      _cloudSyncedAt: Date.now()
    }, { merge: true })
    return true
  } catch (err) {
    console.error('Failed to sync content to Firebase cloud:', err)
    return false
  }
}

// Pull content once
export async function fetchContentFromCloud() {
  const db = getDb()
  if (!db) return null

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data()
    }
  } catch (err) {
    console.warn('Error fetching cloud content:', err)
  }
  return null
}

// Real-time listener: triggers whenever laptop or phone updates content
export function subscribeToCloudContent(onUpdate) {
  const db = getDb()
  if (!db) return () => {}

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        onUpdate(data)
      }
    }, (error) => {
      console.warn('Firebase snapshot listener error:', error)
    })
    return unsubscribe
  } catch (e) {
    console.warn('Failed to subscribe to cloud content:', e)
    return () => {}
  }
}
