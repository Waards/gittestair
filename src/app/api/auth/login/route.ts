import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    let userRole = profile?.role

    if (!profile) {
      const adminSupabase = await createAdminClient()
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.email?.split('@')[0] || 'User',
          role: 'client'
        })

      if (!profileError) {
        const { data: newProfile } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
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
