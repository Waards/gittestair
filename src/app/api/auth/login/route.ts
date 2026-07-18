import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Sign in using the Admin API directly to avoid client-side JSON parsing issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
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
        error: 'Supabase returned non-JSON response',
        statusCode: response.status,
        bodyPreview: bodyText.substring(0, 200)
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

    return NextResponse.json({ success: true, role: userRole })
  } catch (err: any) {
    console.error('Login API error:', err)
    return NextResponse.json({ error: err?.message || 'An unexpected error occurred' }, { status: 500 })
  }
}
