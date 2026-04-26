import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: fcmToken } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', profile.id)
      .single()

    const serverKey = process.env.FIREBASE_SERVER_KEY

    if (fcmToken?.token && serverKey) {
      const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`
        },
        body: JSON.stringify({
          to: fcmToken.token,
          notification: {
            title: 'Test Notification',
            body: 'This is a test push notification from Aircon One!',
            icon: '/logo.jpg'
          },
          data: { type: 'test', url: '/dashboard' }
        })
      })
      const fcmResult = await fcmResponse.json()
      console.log('FCM Result:', fcmResult)
    }

    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working!',
        type: 'test',
        link: '/dashboard'
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      data: {
        profileId: profile.id,
        fcmTokenExists: !!fcmToken?.token,
        inAppNotificationCreated: !notifError
      }
    })
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test notification endpoint',
    usage: 'POST with { email: "user@example.com" }'
  })
}