'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

let messagingInstance: any = null
let getTokenFunc: any = null

async function initFirebase() {
  if (messagingInstance) return { messaging: messagingInstance, getToken: getTokenFunc }

  const { initializeApp, getApps } = await import('firebase/app')
  const { getMessaging, getToken: fetchToken, onMessage } = await import('firebase/messaging')

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
  messagingInstance = getMessaging(app)
  getTokenFunc = fetchToken

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('SW registered:', reg.scope)
    } catch (err) {
      console.log('SW registration failed:', err)
    }
  }

  onMessage(messagingInstance, (payload: any) => {
    console.log('Foreground message:', payload)
    toast.info(payload.notification?.title || 'New Notification', {
      description: payload.notification?.body
    })
  })

  return { messaging: messagingInstance, getToken: getTokenFunc }
}

export function usePushNotifications(userId: string | null) {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setSupported(false)
      return
    }
    setPermission(Notification.permission)
    initFirebase().then(() => setInitialized(true))
  }, [])

  useEffect(() => {
    if (!userId || permission !== 'granted' || !initialized) return

    const saveToken = async (fcmToken: string) => {
      const supabase = createClient()
      await supabase.from('user_fcm_tokens').upsert({
        user_id: userId,
        token: fcmToken,
        updated_at: new Date().toISOString()
      })
      setToken(fcmToken)
    }

    if (token) {
      saveToken(token)
    }
  }, [token, userId, permission, initialized])

  const subscribe = useCallback(async () => {
    if (!initialized) {
      toast.error('Firebase not initialized yet')
      return null
    }

    setLoading(true)
    try {
      const { messaging, getToken } = await initFirebase()
      const currentPermission = await Notification.requestPermission()
      
      if (currentPermission !== 'granted') {
        toast.error('Notification permission denied')
        setPermission('denied')
        return null
      }

      setPermission('granted')
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        toast.error('VAPID key not configured')
        return null
      }

      const fcmToken = await getToken(messaging, { vapidKey })
      
      if (fcmToken) {
        setToken(fcmToken)
        toast.success('Notifications enabled!')
        return fcmToken
      }
      
      toast.error('Failed to get FCM token')
      return null
    } catch (error: any) {
      console.error('FCM error:', error)
      toast.error(error.message || 'Failed to enable notifications')
      return null
    } finally {
      setLoading(false)
    }
  }, [initialized])

  const unsubscribe = useCallback(async () => {
    if (token && userId) {
      const supabase = createClient()
      await supabase.from('user_fcm_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token)
    }
    setToken(null)
    toast.success('Notifications disabled')
  }, [token, userId])

  return { token, permission, loading, supported, subscribe, unsubscribe }
}