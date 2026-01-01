'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('signIn: auth success:', !!data.user, 'error:', error?.message)

  if (error) {
    return { error: error.message }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  console.log('signIn: profile found:', !!profile, 'role:', profile?.role, 'error:', profileError?.message)

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'admin') {
    console.log('signIn: redirecting to /admin')
    redirect('/admin')
  } else {
    console.log('signIn: redirecting to /dashboard')
    redirect('/dashboard')
  }
}

export async function changePassword(formData: FormData) {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || !confirmPassword) {
    return { error: 'Both password fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('getProfile: user found:', !!user)
  if (!user) {
    // Try to get session as fallback
    const { data: { session } } = await supabase.auth.getSession()
    console.log('getProfile: session found:', !!session)
    if (!session) return null
  }

  const userId = user?.id || (await supabase.auth.getSession()).data.session?.user.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('getProfile: error fetching profile:', error)
    return null
  }
  return data
}
