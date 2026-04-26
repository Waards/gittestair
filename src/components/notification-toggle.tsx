'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, Loader2, CheckCircle } from 'lucide-react'

interface NotificationToggleProps {
  userId: string | null
}

export function NotificationToggle({ userId }: NotificationToggleProps) {
  const { token, permission, loading, supported, subscribe, unsubscribe } = usePushNotifications(userId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = async () => {
    if (token) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const handleEnableNow = async () => {
    await subscribe()
  }

  if (!mounted) return null

  const isEnabled = permission === 'granted' || token === 'in-app-only'
  const isDenied = permission === 'denied'

  if (!supported || isDenied) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-xs text-slate-500">
                You receive notifications in your dashboard
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              You will receive notifications in your dashboard when logged in. Push notifications require HTTPS.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">In-App Notifications</p>
            <p className="text-xs text-slate-500">
              {isEnabled 
                ? 'You receive notifications in your dashboard'
                : 'Enable to receive service updates'
              }
            </p>
          </div>
          {isEnabled ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Button
              size="sm"
              onClick={handleEnableNow}
              disabled={loading}
              className="bg-[#0062a3] hover:bg-[#0062a3]/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Enable'
              )}
            </Button>
          )}
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700">
            {isEnabled 
              ? 'Notifications are active. Check your dashboard for updates.'
              : 'Click Enable to start receiving notifications in your dashboard.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}