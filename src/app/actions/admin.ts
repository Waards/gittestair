'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const validatePHPhone = (phone: string): boolean => {
  const phRegex = /^09\d{9}$/;
  return phRegex.test(phone);
};

const PHONE_VALIDATION_ERROR = "Phone number must be a valid Philippines number (e.g., 09123456789) and maximum 11 digits.";

export async function createClientUser(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const clientType = formData.get('clientType') as string
  const phone = formData.get('phone') as string
  
  if (!email || !fullName) {
    return { error: 'Email and Full Name are required' }
  }

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
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
          role: 'client',
          phone: phone,
          password: password,

        client_type: clientType || 'Residential'
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

  if (error) {
    console.error('getClients error:', error)
    return []
  }
  return data || []
}

export async function getInstallations() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('installations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getInstallations error:', error)
    return []
  }
  return data || []
}

export async function getDashboardInstallations() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('installations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) {
    console.error('getDashboardInstallations error:', error)
    return []
  }
  return data || []
}

export async function getRepairs() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('repairs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getRepairs error:', error)
    return []
  }
  return data || []
}

export async function getDashboardRepairs() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('repairs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) {
    console.error('getDashboardRepairs error:', error)
    return []
  }
  return data || []
}

export async function getAppointments() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
  if (error) {
    console.error('getAppointments error:', error)
    return []
  }
  return data || []
}

export async function getSettings() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'main')
    .single()
  if (error && error.code !== 'PGRST116') {
    console.error('getSettings error:', error)
    return null
  }
  return data
}

export async function updateSettings(formData: FormData) {
  const supabase = await createAdminClient()
  const companyPhone = formData.get('companyPhone') as string

  if (companyPhone && !validatePHPhone(companyPhone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const data = {
    company_name: formData.get('companyName') as string,
    company_email: formData.get('companyEmail') as string,
    company_phone: companyPhone,
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

export async function updateNotificationSettings(data: {
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  new_booking_alert: boolean
  booking_update_alert: boolean
  payment_alert: boolean
}) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'main', ...data })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateReminderSettings(data: {
  reminder_enabled: boolean
  reminder_hours_before: number
  follow_up_enabled: boolean
  follow_up_days_after: number
  maintenance_reminder_enabled: boolean
  maintenance_reminder_months: number
}) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'main', ...data })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateSecuritySettings(data: {
  two_factor_enabled: boolean
  session_timeout_minutes: number
  require_password_change_days: number
}) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'main', ...data })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const supabase = await createAdminClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function createAppointment(formData: FormData) {
  const supabase = await createAdminClient()
  const phone = formData.get('phone') as string

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const data = {
    client_name: formData.get('clientName') as string,
    email: formData.get('email') as string,
    phone: phone,
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

export async function createMaintenance(formData: FormData) {
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
    .from('maintenance')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function getMaintenance() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getMaintenance error:', error)
    return []
  }
  return data || []
}

export async function getDashboardMaintenance() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) {
    console.error('getDashboardMaintenance error:', error)
    return []
  }
  return data || []
}

export async function markMaintenanceComplete(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('maintenance')
    .update({ status: 'Completed', progress: 100 })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function getClientRequests() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('client_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getClientRequests error:', error)
    return []
  }
  return data || []
}

export async function getDashboardStats() {
  const supabase = await createAdminClient()
  try {
    const [clientsResult, installationsResult, repairsResult, appointmentsResult, leadsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('installations').select('status', { count: 'exact', head: true }),
      supabase.from('repairs').select('status', { count: 'exact', head: true }),
      supabase.from('appointments').select('status', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true })
    ])

    return {
      totalClients: clientsResult.count || 0,
      totalInstallations: installationsResult.count || 0,
      totalRepairs: repairsResult.count || 0,
      totalAppointments: appointmentsResult.count || 0,
      totalLeads: leadsResult.count || 0
    }
  } catch (error) {
    console.error('getDashboardStats error:', error)
    return {
      totalClients: 0,
      totalInstallations: 0,
      totalRepairs: 0,
      totalAppointments: 0,
      totalLeads: 0
    }
  }
}

export async function getNotifications() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .is('user_id', null)           // only admin/global notifications
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('getNotifications error:', error)
    return []
  }
  return data || []
}

export async function sendClientReminder(clientId: string, title: string, message: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: clientId,
      title,
      message,
      type: 'reminder',
      is_read: false
    })
  
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateRequestStatus(id: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('client_requests')
    .update({ status })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function archiveClient(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_archived: true })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function unarchiveClient(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_archived: false })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function getClientById(id: string) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getTechnicians() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getTechnicians error:', error)
    return []
  }
  return data || []
}

export async function createTechnician(formData: FormData) {
  const supabase = await createAdminClient()
  const phone = formData.get('phone') as string

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const data = {
    full_name: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phone: phone,
    specialization: formData.get('specialization') as string || 'General',
    status: 'Active',
    hire_date: formData.get('hireDate') as string || new Date().toISOString().split('T')[0],
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase
    .from('technicians')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateTechnician(id: string, formData: FormData) {
  const supabase = await createAdminClient()
  const phone = formData.get('phone') as string

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const data = {
    full_name: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phone: phone,
    specialization: formData.get('specialization') as string,
    notes: formData.get('notes') as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('technicians')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateTechnicianStatus(id: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('technicians')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteTechnician(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('technicians')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
