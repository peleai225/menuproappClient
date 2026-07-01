import { initializeApp, getApps } from "firebase/app"
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging"

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

function getApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

let _messaging: Messaging | null = null

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null
  if (!("serviceWorker" in navigator)) return null
  try {
    _messaging ??= getMessaging(getApp())
    return _messaging
  } catch {
    return null
  }
}

export async function requestFcmToken(): Promise<string | null> {
  const messaging = getFirebaseMessaging()
  if (!messaging) return null

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return null

    const swReg = await navigator.serviceWorker.ready
    return await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg })
  } catch {
    return null
  }
}

export { onMessage }
