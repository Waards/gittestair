import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Missing Supabase config in Vercel env vars' }, { status: 500 })
    }

    const targetUrl = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`

    if (targetUrl.includes('azelea') || targetUrl.includes('vercel') || targetUrl.includes('localhost')) {
      return NextResponse.json({
        error: `WRONG SUPABASE URL in Vercel env: ${supabaseUrl}`,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '(not set)'
      }, { status: 500 })
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email, password })
    })

    const bodyText = await response.text()
    let authData
    try {
      authData = JSON.parse(bodyText)
    } catch {
      return NextResponse.json({
        error: `Supabase returned HTTP ${response.status}: ${bodyText.substring(0, 300)}`
      }, { status: 502 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: authData.msg || authData.error_description || 'Invalid credentials' }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    let userRole = profile?.role

    if (!profile) {
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.email?.split('@')[0] || 'User',
          role: 'client'
        })

      if (!profileError) {
        const { data: newProfile } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()
        if (newProfile) userRole = newProfile.role
      }
    }

    return NextResponse.json({ success: true, role: userRole }, {
      headers: {
        'Set-Cookie': `sb-access-token=${authData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`
      }
    })
  } catch (err: any) {
    console.error('Login API error:', err)
    return NextResponse.json({ error: `Server error: ${err?.message || 'Unknown'}` }, { status: 500 })
  }
}
