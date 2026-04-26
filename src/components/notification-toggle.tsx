'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationToggleProps {
  userId: string | null
}

export function NotificationToggle({ userId }: NotificationToggleProps) {
  const { token, permission, loading, supported, subscribe, unsubscribe } = usePushNotifications(userId)

  const handleToggle = async () => {
    if (token) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  if (!supported) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-4">
          <BellOff className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-500">
            Push notifications are not supported in this browser
          </p>
        </CardContent>
      </Card>
    )
  }

  const isEnabled = permission === 'granted' && token
  const isDenied = permission === 'denied'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Service Updates</p>
            <p className="text-xs text-slate-500">
              {isEnabled 
                ? 'You will receive push notifications for service updates'
                : isDenied 
                  ? 'Notifications are blocked. Please allow in browser settings.'
                  : 'Enable to receive real-time service notifications'
              }
            </p>
          </div>
          <Button
            variant={isEnabled ? "destructive" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={isEnabled ? "bg-green-600 hover:bg-green-700" : "bg-[#0062a3] hover:bg-[#0062a3]/90"}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEnabled ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>

        {isDenied && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              To enable notifications, click the lock/info icon in your browser's address bar and allow notifications.
            </p>
          </div>
        )}

        {isEnabled && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              Notifications are enabled. You will receive alerts for service completions, reminders, and updates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}