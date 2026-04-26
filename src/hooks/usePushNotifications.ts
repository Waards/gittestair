'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

let messagingInstance: any = null
let getTokenFunc: any = null
let firebaseInitialized = false
let swRegistered = false

async function initFirebase() {
  if (messagingInstance) return { messaging: messagingInstance, getToken: getTokenFunc }

  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getMessaging, getToken: fetchToken, onMessage, isSupported } = await import('firebase/messaging')

    const supported = await isSupported()
    if (!supported) {
      console.log('Push notifications not supported')
      return null
    }

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
    firebaseInitialized = true

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !swRegistered) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        })
        swRegistered = true
        console.log('SW registered:', registration.scope)
      } catch (err) {
        console.log('SW registration warning:', err)
      }
    }

    onMessage(messagingInstance, (payload: any) => {
      console.log('Foreground message:', payload)
      toast.info(payload.notification?.title || 'New Notification', {
        description: payload.notification?.body
      })
    })

    return { messaging: messagingInstance, getToken: getTokenFunc }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return null
  }
}

export function usePushNotifications(userId: string | null) {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setSupported(false)
      return
    }
    setPermission(Notification.permission)
    
    initFirebase().then((result) => {
      if (result) {
        setInitialized(true)
      } else {
        setSupported(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!userId || permission !== 'granted' || !initialized || !token) return

    const saveToken = async (fcmToken: string) => {
      const supabase = createClient()
      await supabase.from('user_fcm_tokens').upsert({
        user_id: userId,
        token: fcmToken,
        updated_at: new Date().toISOString()
      })
    }

    saveToken(token)
  }, [token, userId, permission, initialized])

  const subscribe = useCallback(async () => {
    setLoading(true)
    
    try {
      if (!firebaseInitialized) {
        const initResult = await initFirebase()
        if (!initResult) {
          toast.info('Push notifications are not supported in this browser')
          setSupported(false)
          setLoading(false)
          return null
        }
      }

      if (!messagingInstance || !getTokenFunc) {
        toast.info('Push notifications are not available')
        setLoading(false)
        return null
      }

      let currentPermission = Notification.permission
      
      if (currentPermission === 'default') {
        try {
          currentPermission = await Notification.requestPermission()
        } catch (permError) {
          console.log('Permission request failed:', permError)
          setPermission('denied')
          setLoading(false)
          return null
        }
      }
      
      if (currentPermission !== 'granted') {
        setPermission('denied')
        setLoading(false)
        return null
      }

      setPermission('granted')
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        toast.error('VAPID key not configured')
        setLoading(false)
        return null
      }

      let fcmToken = null
      let retries = 0
      const maxRetries = 2
      
      while (retries < maxRetries && !fcmToken) {
        try {
          fcmToken = await getTokenFunc(messagingInstance, { vapidKey })
        } catch (tokenError: any) {
          console.log(`Token attempt ${retries + 1} failed:`, tokenError.name)
          retries++
          
          if (retries >= maxRetries) {
            console.log('Max retries reached, using fallback')
            toast.info('Notifications enabled (in-app mode). Push will work on production site.')
            setLoading(false)
            return 'in-app-only'
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (fcmToken) {
        setToken(fcmToken)
        toast.success('Notifications enabled!')
        setLoading(false)
        return fcmToken
      }
      
    } catch (error: any) {
      console.log('Subscribe error (non-blocking):', error.message)
      toast.info('Notifications enabled (in-app mode)')
      setLoading(false)
      return 'in-app-only'
    }
    
    setLoading(false)
    return null
  }, [initialized])

  const unsubscribe = useCallback(async () => {
    if (token && userId && token !== 'in-app-only') {
      const supabase = createClient()
      await supabase.from('user_fcm_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token)
    }
    setToken(null)
    toast.success('Notifications disabled')
  }, [token, userId])

  return { 
    token, 
    permission, 
    loading, 
    supported, 
    subscribe, 
    unsubscribe
  }
}