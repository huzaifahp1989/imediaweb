import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

const statsConfig = {
  apiKey: import.meta.env.VITE_STATS_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_STATS_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_STATS_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STATS_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_STATS_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_STATS_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_STATS_MEASUREMENT_ID,
}

let statsApp = null
export async function getStatsAnalytics() {
  if (!statsConfig.measurementId || typeof window === 'undefined') return null
  if (!statsApp) {
    statsApp = initializeApp(statsConfig, 'islam-media-stats')
  }
  if (await isSupported()) {
    return getAnalytics(statsApp)
  }
  return null
}

export const COLLECTIONS = {
  tracks: 'tracks',
  adAudio: 'adAudio',
  kidsSubmissions: 'kidsSubmissions',
  userSubmissions: 'userSubmissions',
  nasheedRequests: 'nasheedRequests',
  views: 'views',
  votes: 'votes',
}
