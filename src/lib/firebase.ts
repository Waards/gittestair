import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyCQ4wu4cbbzl0JNRvS0saoG85ESV5GciDM",
  authDomain: "notif-11720.firebaseapp.com",
  projectId: "notif-11720",
  storageBucket: "notif-11720.firebasestorage.app",
  messagingSenderId: "659699156774",
  appId: "1:659699156774:web:12d31f0fe0edf83b52a3e7",
  measurementId: "G-NX9EY94GFZ"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const messaging = getMessaging(app)

export const requestPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    })

    if (token) {
      console.log('FCM Token:', token)
      return token
    }
    return null
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

export const onMessageListener = (callback: (payload: unknown) => void) => {
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}