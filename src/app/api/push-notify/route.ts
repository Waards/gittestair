import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url, type } = await req.json()

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: fcmToken, error: tokenError } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .single()

    if (tokenError || !fcmToken?.token) {
      return NextResponse.json({ error: 'No FCM token found for user' }, { status: 404 })
    }

    const serverKey = process.env.FIREBASE_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'FCM server key not configured' }, { status: 500 })
    }

    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      },
      body: JSON.stringify({
        to: fcmToken.token,
        notification: {
          title,
          body,
          icon: '/logo.jpg',
          badge: '/logo.jpg'
        },
        data: { url, type }
      })
    })

    const result = await fcmResponse.json()

    if (result.success) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message: body,
        type: type || 'push',
        link: url
      })

      return NextResponse.json({ success: true, messageId: result.results[0]?.message_id })
    }

    return NextResponse.json({ error: 'FCM send failed', details: result }, { status: 500 })

  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}