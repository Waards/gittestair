const jwt = require('jsonwebtoken')

export async function getFCMAccessToken(): Promise<string> {
  const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')
  
  if (!credentials.client_email || !credentials.private_key) {
    console.error('Firebase credentials not configured')
    return ''
  }

  const now = Math.floor(Date.now() / 1000)
  
  const token = jwt.sign(
    {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.googleapis.googleapis.com/token',
      iat: now,
      exp: now + 3600
    },
    credentials.private_key.replace(/\\n/g, '\n'),
    { algorithm: 'RS256' }
  )

  try {
    const response = await fetch('https://oauth2.googleapis.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${token}`
    })

    const data = await response.json()
    return data.access_token || ''
  } catch (error) {
    console.error('Error getting access token:', error)
    return ''
  }
}

export async function sendFCMNotification(token: string, title: string, body: string, data?: Record<string, string>) {
  const projectId = 'notif-11720'
  const accessToken = await getFCMAccessToken()
  
  if (!accessToken) {
    console.error('No access token available')
    return null
  }

  try {
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: {
          token: token,
          notification: { title, body },
          webpush: {
            notification: { icon: '/logo.jpg' },
            fcm_options: { link: '/dashboard' }
          },
          data: data || {}
        }
      })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('FCM send error:', error)
    return null
  }
}