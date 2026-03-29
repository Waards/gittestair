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

  const dateStr = formData.get('date') as string
  if (dateStr) {
    // Enforce Max Bookings per day (Maximum 4 bookings)
    const { count: appointmentsCount, error: apptError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('date', dateStr)

    const { count: leadsCount, error: leadsError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('preferred_date', dateStr)
      .neq('status', 'Cancelled')

    if (apptError || leadsError) {
      console.error('Error checking availability:', apptError || leadsError)
      return { error: 'Failed to verify booking availability. Please try again later.' }
    }

    const totalBookings = (appointmentsCount || 0) + (leadsCount || 0)
    
    if (totalBookings >= 4) {
      return { error: 'This date is fully booked (Max 4 bookings). Please select another day.' }
    }
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

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
  if (error) return { error: error.message }

  // Notify client if reachable
  const { data: apt } = await supabase.from('appointments').select('*').eq('id', id).single()
  if (apt?.email) {
    const { data: client } = await supabase.from('profiles').select('id').eq('email', apt.email).single()
    if (client?.id) {
      await supabase.from('notifications').insert({
        user_id: client.id,
        title: 'Appointment Status Updated',
        message: `Your appointment status is now: ${status}.`,
        type: 'update',
        link: '/dashboard'
      })
    }
  }
  revalidatePath('/admin')
  return { success: true }
}

export async function rescheduleAppointment(id: string, date: string, time: string) {
  const supabase = await createAdminClient()
  
  // Enforce Max Bookings per day (Maximum 4 bookings) for the new date
  const { count: appointmentsCount, error: apptError } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('date', date)

  const { count: leadsCount, error: leadsError } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('preferred_date', date)
    .neq('status', 'Cancelled')

  if (apptError || leadsError) {
    return { error: 'Failed to verify booking availability for the new date.' }
  }

  const totalBookings = (appointmentsCount || 0) + (leadsCount || 0)
  
  if (totalBookings >= 4) {
    return { error: 'The new date is fully booked (Max 4 bookings). Please select another day.' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ date, time })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// --------------------------------------------------------------------
// ASSET REGISTRY - client_units
// --------------------------------------------------------------------

export async function registerUnit(formData: FormData) {
  const supabase = await createAdminClient()
  const clientId = formData.get('clientId') as string
  const unitName = formData.get('unitName') as string
  const brand = formData.get('brand') as string
  const unitType = formData.get('unitType') as string
  const technology = formData.get('technology') as string
  const horsepower = parseFloat(formData.get('horsepower') as string)
  const indoorSerial = formData.get('indoorSerial') as string
  const outdoorSerial = formData.get('outdoorSerial') as string
  const installationDate = formData.get('installationDate') as string
  if (!clientId || !unitName || !brand || !unitType || !technology || !horsepower) {
    return { error: 'Please fill in all required fields.' }
  }
  const { data, error } = await supabase
    .from('client_units')
    .insert({ client_id: clientId, unit_name: unitName, brand, unit_type: unitType, technology, horsepower, indoor_serial: indoorSerial || null, outdoor_serial: outdoorSerial || null, installation_date: installationDate || null })
    .select().single()
  if (error) { console.error('registerUnit error:', error); return { error: error.message } }
  revalidatePath('/admin')
  return { success: true, unit: data }
}

export async function getClientUnits(clientId?: string) {
  const supabase = await createAdminClient()
  let query = supabase.from('client_units').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
  if (clientId) { query = query.eq('client_id', clientId) }
  const { data, error } = await query
  if (error) { console.error('getClientUnits error:', error); return [] }
  return data || []
}

export async function deleteClientUnit(unitId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('client_units').delete().eq('id', unitId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// --------------------------------------------------------------------
// REPAIR DIAGNOSIS - repair_jobs
// --------------------------------------------------------------------

export async function logRepairJob(formData: FormData) {
  const supabase = await createAdminClient()
  const unitId = formData.get('unitId') as string
  const clientId = formData.get('clientId') as string
  const errorCode = formData.get('errorCode') as string
  const symptom = formData.get('symptom') as string
  const partsJson = formData.get('partsReplaced') as string
  const beforePhotoUrl = formData.get('beforePhotoUrl') as string
  const afterPhotoUrl = formData.get('afterPhotoUrl') as string
  if (!clientId) { return { error: 'Client is required.' } }
  let partsReplaced: any[] = []
  try { partsReplaced = partsJson ? JSON.parse(partsJson) : [] } catch { partsReplaced = [] }
  const { data, error } = await supabase
    .from('repair_jobs')
    .insert({ unit_id: unitId || null, client_id: clientId, error_code: errorCode || null, symptom: symptom || null, parts_replaced: partsReplaced, before_photo_url: beforePhotoUrl || null, after_photo_url: afterPhotoUrl || null, status: 'Open' })
    .select().single()
  if (error) { console.error('logRepairJob error:', error); return { error: error.message } }
  revalidatePath('/admin')
  return { success: true, job: data }
}

export async function getRepairJobs() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('repair_jobs')
    .select('*, client_units(unit_name, brand, unit_type), profiles(full_name)')
    .order('created_at', { ascending: false })
  if (error) { console.error('getRepairJobs error:', error); return [] }
  return data || []
}

export async function updateRepairJobStatus(jobId: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('repair_jobs').update({ status }).eq('id', jobId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// --------------------------------------------------------------------
// MAINTENANCE WITH MULTI-UNIT SUPPORT
// --------------------------------------------------------------------

export async function createMaintenanceWithUnits(formData: FormData) {
  const supabase = await createAdminClient()
  
  const clientId = formData.get('clientId') as string
  const clientName = formData.get('clientName') as string
  const location = formData.get('address') as string
  const technician = formData.get('technician') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string
  const type = formData.get('type') as string
  
  // Parse JSON strings for unit IDs and service types
  let unitIds: string[] = []
  let serviceTypes: string[] = []
  
  try {
    const unitIdsJson = formData.get('unitIdsJson') as string
    const serviceTypesJson = formData.get('serviceTypesJson') as string
    unitIds = unitIdsJson ? JSON.parse(unitIdsJson) : []
    serviceTypes = serviceTypesJson ? JSON.parse(serviceTypesJson) : []
  } catch (e) {
    console.error('Error parsing unit data:', e)
    return { error: 'Invalid unit data' }
  }
  
  if (!clientName || !date || !time || unitIds.length === 0) {
    return { error: 'Please fill in all required fields and select at least one unit.' }
  }
  
  // Create the main maintenance record
  const { data: maintenance, error: maintenanceError } = await supabase
    .from('maintenance')
    .insert({
      title: 'Multi-Unit Maintenance',
      client_name: clientName,
      location,
      technician,
      date,
      time,
      notes,
      type: type || 'Scheduled',
      status: 'Scheduled',
      progress: 0,
      is_multi_unit: true,
      client_id: clientId || null
    })
    .select()
    .single()
  
  if (maintenanceError) {
    console.error('createMaintenanceWithUnits error:', maintenanceError)
    return { error: maintenanceError.message }
  }
  
  // Create maintenance items for each selected unit
  const maintenanceItems = unitIds.map((unitId, index) => ({
    maintenance_id: maintenance.id,
    unit_id: unitId,
    service_type: serviceTypes[index] || 'Cleaning',
    status: 'Pending',
    next_cleaning_date: null
  }))
  
  const { error: itemsError } = await supabase
    .from('maintenance_items')
    .insert(maintenanceItems)
  
  if (itemsError) {
    console.error('createMaintenanceWithUnits items error:', itemsError)
    // Rollback - delete the maintenance record
    await supabase.from('maintenance').delete().eq('id', maintenance.id)
    return { error: itemsError.message }
  }
  
  revalidatePath('/admin')
  return { success: true, maintenance }
}

export async function getMaintenanceWithItems() {
  const supabase = await createAdminClient()
  
  try {
    // Get all maintenance records
    const { data: maintenance, error } = await supabase
      .from('maintenance')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('getMaintenanceWithItems error:', error)
      return []
    }
    
    // Get all maintenance items (if table exists)
    let items: any[] = []
    try {
      const { data: itemsData } = await supabase
        .from('maintenance_items')
        .select('*, client_units(unit_name, brand, unit_type, technology, horsepower)')
      items = itemsData || []
    } catch (e) {
      // Table might not exist yet
      console.log('maintenance_items table not ready yet')
    }
    
    // Attach items to maintenance records
    const maintenanceWithItems = (maintenance || []).map(m => ({
      ...m,
      items: items.filter(item => item.maintenance_id === m.id)
    }))
    
    return maintenanceWithItems
  } catch (e) {
    console.error('getMaintenanceWithItems fatal error:', e)
    return []
  }
}

export async function updateMaintenanceItemStatus(itemId: string, status: string) {
  const supabase = await createAdminClient()
  
  const updateData: any = { status }
  
  // If marking as Done, set completed_at and calculate next cleaning date
  if (status === 'Done') {
    const completedAt = new Date()
    updateData.completed_at = completedAt.toISOString()
    
    // Auto-generate next cleaning date (default +3 months)
    const nextDate = new Date(completedAt)
    nextDate.setMonth(nextDate.getMonth() + 3)
    updateData.next_cleaning_date = nextDate.toISOString().split('T')[0]
  }
  
  const { error } = await supabase
    .from('maintenance_items')
    .update(updateData)
    .eq('id', itemId)
  
  if (error) return { error: error.message }
  
  // Update parent maintenance status based on items
  await updateMaintenanceParentStatus(itemId)
  
  revalidatePath('/admin')
  return { success: true }
}

async function updateMaintenanceParentStatus(itemId: string) {
  const supabase = await createAdminClient()
  
  // Get the maintenance item to find its parent
  const { data: item } = await supabase
    .from('maintenance_items')
    .select('maintenance_id')
    .eq('id', itemId)
    .single()
  
  if (!item) return
  
  // Get all items for this maintenance
  const { data: items } = await supabase
    .from('maintenance_items')
    .select('status')
    .eq('maintenance_id', item.maintenance_id)
  
  if (!items || items.length === 0) return
  
  const allDone = items.every(i => i.status === 'Done')
  const anyInProgress = items.some(i => i.status === 'In Progress')
  const anyPending = items.some(i => i.status === 'Pending')
  
  let newStatus = 'Scheduled'
  let progress = 0
  
  if (allDone) {
    newStatus = 'Completed'
    progress = 100
  } else if (anyInProgress) {
    newStatus = 'In Progress'
    progress = Math.round((items.filter(i => i.status === 'Done').length / items.length) * 100)
  } else if (anyPending) {
    newStatus = 'Scheduled'
    progress = Math.round((items.filter(i => i.status === 'Done').length / items.length) * 100)
  }
  
  await supabase
    .from('maintenance')
    .update({ status: newStatus, progress })
    .eq('id', item.maintenance_id)
}

export async function updateMaintenanceItemServiceType(itemId: string, serviceType: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('maintenance_items')
    .update({ service_type: serviceType })
    .eq('id', itemId)
  
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteMaintenanceItem(itemId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('maintenance_items')
    .delete()
    .eq('id', itemId)
  
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
