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
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(FIREBASE_CONFIG_KEY)
      if (saved) return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e)
  }

  // Fallback to environment variables if provided
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      }
    }
  } catch (e) {
    // ignore
  }

  return DEFAULT_FIREBASE_CONFIG
}

export function saveStoredFirebaseConfig(config) {
  try {
    if (typeof localStorage === 'undefined') return
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

const CHUNK_SIZE = 700000 // 700KB per Firestore document (safe under 1048487 bytes limit)

// Reconstruct complete JSON content from single payload, chunks, or legacy fields
async function reconstructContent(docData, db) {
  if (!docData) return null

  // 1. Chunked documents
  if (docData.isChunked && docData.chunkCount) {
    try {
      let combined = ''
      for (let i = 0; i < docData.chunkCount; i++) {
        const chunkSnap = await getDoc(doc(db, COLLECTION_NAME, `chunk_${i}`))
        if (chunkSnap.exists()) {
          combined += (chunkSnap.data()?.data || '')
        }
      }
      if (combined) {
        return JSON.parse(combined)
      }
    } catch (e) {
      console.error('Error reconstructing chunked Firestore content:', e)
    }
  }

  // 2. Single payload string
  if (docData.payload) {
    try {
      return JSON.parse(docData.payload)
    } catch (e) {
      console.error('Error parsing Firestore payload:', e)
    }
  }

  // 3. Direct document fields (legacy fallback)
  return docData
}

// Push latest portfolio content to cloud Firestore (with automatic chunking for large media)
export async function pushContentToCloud(contentData) {
  const db = getDb()
  if (!db) {
    console.warn('Firebase DB not initialized, cannot push')
    return false
  }

  try {
    // Strip any undefined fields
    const cleanData = JSON.parse(JSON.stringify(contentData))
    cleanData._lastSavedAt = cleanData._lastSavedAt || Date.now()
    cleanData._cloudSyncedAt = Date.now()
    const jsonStr = JSON.stringify(cleanData)

    const docRef = doc(db, COLLECTION_NAME, DOC_ID)

    if (jsonStr.length < CHUNK_SIZE) {
      // Safe in a single document
      await setDoc(docRef, {
        isChunked: false,
        payload: jsonStr,
        _lastSavedAt: cleanData._lastSavedAt,
        _cloudSyncedAt: cleanData._cloudSyncedAt
      })
    } else {
      // Chunk across multiple documents to never exceed Firestore 1MB limits
      const totalChunks = Math.ceil(jsonStr.length / CHUNK_SIZE)
      for (let i = 0; i < totalChunks; i++) {
        const chunkPart = jsonStr.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        await setDoc(doc(db, COLLECTION_NAME, `chunk_${i}`), {
          data: chunkPart,
          index: i,
          updatedAt: Date.now()
        })
      }
      await setDoc(docRef, {
        isChunked: true,
        chunkCount: totalChunks,
        _lastSavedAt: cleanData._lastSavedAt,
        _cloudSyncedAt: cleanData._cloudSyncedAt
      })
    }

    console.log('Successfully synced content to Firebase cloud!')
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
      return await reconstructContent(snap.data(), db)
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
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = await reconstructContent(docSnap.data(), db)
        if (data) {
          onUpdate(data)
        }
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
