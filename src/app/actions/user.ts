'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validatePHPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils'

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('signIn action started for:', email)

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('signIn: auth result:', !!data.user, error?.message)

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  console.log('signIn: profile result:', !!profile, profile?.role)

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'admin') {
    redirect('/admin')
  } else {
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

export async function getUserNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserNotifications: error:', error)
    return []
  }
  return data
}

export async function markUserNotificationAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('getProfile: error fetching profile:', error)
    return null
  }
  return data
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalBookings: 0,
      activeServices: 0,
      completedServices: 0
    }
  }

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('status')
    .eq('email', user.email)

  if (error) {
    console.error('getDashboardStats: error fetching appointments:', error)
    return {
      totalBookings: 0,
      activeServices: 0,
      completedServices: 0
    }
  }

  const totalBookings = appointments?.length || 0
  const activeServices = appointments?.filter(a => a.status === 'scheduled' || a.status === 'in_progress' || a.status === 'pending').length || 0
  const completedServices = appointments?.filter(a => a.status === 'completed' || a.status === 'finished').length || 0

  return {
    totalBookings,
    activeServices,
    completedServices
  }
}

export async function getUserActivity() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserActivity: error fetching appointments:', error)
    return []
  }

  return data
}

export async function requestService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to request a service' }
  }

  const serviceType = formData.get('serviceType') as string
  const phone = formData.get('phone') as string

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const address = formData.get('address') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  if (!serviceType || !phone || !date || !time) {
    return { error: 'Please fill in all required fields (Service Type, Phone, Date, and Time)' }
  }

  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('appointments')
    .insert({
      client_name: profile?.full_name || user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      phone,
      address,
      date,
      time,
      service_type: serviceType,
      notes,
      status: 'pending'
    })

  // Create client request record for admin
  await supabase
    .from('client_requests')
    .insert({
      client_id: user.id,
      client_name: profile?.full_name || user.email?.split('@')[0] || 'Unknown',
      request_type: serviceType,
      message: notes,
      preferred_date: date,
      preferred_time: time
    })

  // Create notification for admin
  await supabase
    .from('notifications')
    .insert({
      title: 'New Client Request',
      message: `${profile?.full_name || user.email} has requested a new ${serviceType} service.`,
      type: 'request',
      link: '/admin'
    })

  if (error) {
    console.error('requestService: error inserting appointment:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
