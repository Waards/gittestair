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

  const password = Math.random().toString(36).slice(-10) + '!'

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'client'
    })

  if (profileError) {
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

export async function getInstallations() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('installations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRepairs() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('repairs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAppointments() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function getSettings() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'main')
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateSettings(formData: FormData) {
  const supabase = await createAdminClient()
  const data = {
    company_name: formData.get('companyName') as string,
    company_email: formData.get('companyEmail') as string,
    company_phone: formData.get('companyPhone') as string,
    timezone: formData.get('timezone') as string,
    company_address: formData.get('companyAddress') as string,
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'main', ...data })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function createAppointment(formData: FormData) {
  const supabase = await createAdminClient()
  const data = {
    client_name: formData.get('clientName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    service_type: formData.get('serviceType') as string,
    cost: formData.get('cost') as string,
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase
    .from('appointments')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function createInstallation(formData: FormData) {
  const supabase = await createAdminClient()
  const type = formData.get('type') as string
  const data = {
    title: formData.get('serviceType') as string,
    client_name: formData.get('clientName') as string,
    location: formData.get('address') as string,
    technician: formData.get('technician') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    cost: formData.get('cost') as string,
    notes: formData.get('notes') as string,
    type: type,
    status: type === 'Real-Time' ? 'In Progress' : 'Scheduled',
    progress: type === 'Real-Time' ? 10 : 0
  }

  const { error } = await supabase
    .from('installations')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function createRepair(formData: FormData) {
  const supabase = await createAdminClient()
  const type = formData.get('type') as string
  const data = {
    title: formData.get('serviceType') as string,
    client_name: formData.get('clientName') as string,
    location: formData.get('address') as string,
    technician: formData.get('technician') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    cost: formData.get('cost') as string,
    notes: formData.get('notes') as string,
    type: type,
    status: type === 'Real-Time' ? 'In Progress' : 'Scheduled',
    progress: type === 'Real-Time' ? 10 : 0
  }

  const { error } = await supabase
    .from('repairs')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function markInstallationComplete(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('installations')
    .update({ status: 'Completed', progress: 100 })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function markRepairComplete(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('repairs')
    .update({ status: 'Completed', progress: 100 })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
