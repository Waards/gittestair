'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createClientUser(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  
  if (!email || !fullName) {
    return { error: 'Email and Full Name are required' }
  }

  const supabase = await createAdminClient()

  // Generate a random password
  const password = Math.random().toString(36).slice(-10) + '!'

  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'client'
    })

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/admin')
  return { success: true, password }
}

export async function getClients() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
