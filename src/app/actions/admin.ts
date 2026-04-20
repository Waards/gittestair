'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { sanitizedString } from '@/lib/security'
import { checkWarrantyStatus } from '@/lib/utils'

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

export async function getClients(page: number = 1, limit: number = 20) {
  const supabase = await createAdminClient()
  const offset = (page - 1) * limit
  
  // Single query with both data and count
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'client')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('getClients error:', error)
    return { data: [], total: 0 }
  }

  return { data: data || [], total: count || 0 }
}

export async function getInstallations(page: number = 1, limit: number = 20) {
  const supabase = await createAdminClient()
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('installations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('getInstallations error:', error)
    return { data: [], total: 0 }
  }

  return { data: data || [], total: count || 0 }
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

export async function getRepairs(page: number = 1, limit: number = 20) {
  const supabase = await createAdminClient()
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('repairs')
    .select('*, client_units(unit_name, brand, unit_type, technology, horsepower)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('getRepairs error:', error)
    return { data: [], total: 0 }
  }

  return { data: data || [], total: count || 0 }
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

export async function getAvailableTimeSlots(date: string) {
  const supabase = await createAdminClient()
  
  const allSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
  ]

  const { data: bookings, error } = await supabase
    .from('appointments')
    .select('time')
    .eq('date', date)
    .neq('status', 'cancelled')

  if (error) {
    console.error('getAvailableTimeSlots error:', error)
    return allSlots
  }

  const bookedSlots = (bookings || []).map(b => b.time)
  return allSlots.filter(slot => !bookedSlots.includes(slot))
}

export async function rescheduleAppointment(id: string, newDate: string, newTime: string) {
  const supabase = await createAdminClient()
  
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, leads!inner(*)')
    .eq('id', id)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Appointment not found' }
  }

  const originalDateTime = new Date(`${appointment.date}T${appointment.time.split(' - ')[0]}`)
  const threeHoursBefore = new Date(originalDateTime.getTime() - (3 * 60 * 60 * 1000))
  const now = new Date()

  if (now >= threeHoursBefore) {
    return { error: 'Rescheduling is only allowed up to 3 hours before the original scheduled time' }
  }

  const { data: existingBooking } = await supabase
    .from('appointments')
    .select('id')
    .eq('date', newDate)
    .eq('time', newTime)
    .neq('id', id)
    .neq('status', 'cancelled')
    .single()

  if (existingBooking) {
    return { error: 'This time slot is already booked' }
  }

  const newRescheduleCount = (appointment.reschedule_count || 0) + 1

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ 
      date: newDate, 
      time: newTime,
      reschedule_count: newRescheduleCount,
      status: 'Rescheduled'
    })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin')
  return { success: true }
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

  const data = sanitizeJobFormData(formData, type)

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

  const data = sanitizeJobFormData(formData, type)

  const { error } = await supabase
    .from('repairs')
    .insert(data)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

function sanitizeJobFormData(formData: FormData, type: string): Record<string, unknown> {
  const data: Record<string, unknown> = {
    title: sanitizedString(formData.get('serviceType') as string || ''),
    client_name: sanitizedString(formData.get('clientName') as string || ''),
    location: sanitizedString(formData.get('address') as string || ''),
    technician: sanitizedString(formData.get('technician') as string || ''),
    date: formData.get('date') as string || '',
    time: formData.get('time') as string || '',
    cost: formData.get('cost') as string || '',
    notes: sanitizedString(formData.get('notes') as string || ''),
    type: type || 'Standard',
    status: type === 'Real-Time' ? 'In Progress' : 'Scheduled',
    progress: type === 'Real-Time' ? 10 : 0
  }
  return data
}

export async function markInstallationComplete(id: string) {
  const supabase = await createAdminClient()
  
  try {
    const { data: job, error: fetchError } = await supabase
      .from('installations')
      .select('client_request_id')
      .eq('id', id)
      .single()

    if (!fetchError && job?.client_request_id) {
      const { data: request } = await supabase
        .from('client_requests')
        .select('status')
        .eq('id', job.client_request_id)
        .single()
      
      if (request?.status !== 'Approved') {
        return { error: 'Cannot complete. Client request must be approved first in Client Requests section.' }
      }
    }
  } catch (e) {
    console.log('client_request_id check skipped:', e)
  }

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
  
  try {
    const { data: job, error: fetchError } = await supabase
      .from('repairs')
      .select('client_request_id')
      .eq('id', id)
      .single()

    if (!fetchError && job?.client_request_id) {
      const { data: request } = await supabase
        .from('client_requests')
        .select('status')
        .eq('id', job.client_request_id)
        .single()
      
      if (request?.status !== 'Approved') {
        return { error: 'Cannot complete. Client request must be approved first in Client Requests section.' }
      }
    }
  } catch (e) {
    console.log('client_request_id check skipped:', e)
  }

  const { error } = await supabase
    .from('repairs')
    .update({ status: 'Completed', progress: 100 })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateInstallationProgress(id: string, status: string, progress: number, notes?: string) {
  const supabase = await createAdminClient()
  
  try {
    const { data: job, error: fetchError } = await supabase
      .from('installations')
      .select('client_request_id')
      .eq('id', id)
      .single()

    if (!fetchError && job?.client_request_id) {
      const { data: request } = await supabase
        .from('client_requests')
        .select('status')
        .eq('id', job.client_request_id)
        .single()
      
      if (request?.status !== 'Approved') {
        return { error: 'Cannot update. Client request must be approved first in Client Requests section.' }
      }
    }
  } catch (e) {
    console.log('client_request_id check skipped:', e)
  }

  const updateData: any = { status, progress }
  if (notes) updateData.notes = notes
  const { error } = await supabase
    .from('installations')
    .update(updateData)
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateRepairProgress(id: string, status: string, progress: number, notes?: string) {
  const supabase = await createAdminClient()
  
  try {
    const { data: job, error: fetchError } = await supabase
      .from('repairs')
      .select('client_request_id')
      .eq('id', id)
      .single()

    if (!fetchError && job?.client_request_id) {
      const { data: request } = await supabase
        .from('client_requests')
        .select('status')
        .eq('id', job.client_request_id)
        .single()
      
      if (request?.status !== 'Approved') {
        return { error: 'Cannot update. Client request must be approved first in Client Requests section.' }
      }
    }
  } catch (e) {
    console.log('client_request_id check skipped:', e)
  }

  const updateData: any = { status, progress }
  if (notes) updateData.notes = notes
  const { error } = await supabase
    .from('repairs')
    .update(updateData)
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateMaintenanceProgress(id: string, status: string, progress: number, notes?: string) {
  const supabase = await createAdminClient()
  
  try {
    const { data: job, error: fetchError } = await supabase
      .from('maintenance')
      .select('client_request_id')
      .eq('id', id)
      .single()

    if (!fetchError && job?.client_request_id) {
      const { data: request } = await supabase
        .from('client_requests')
        .select('status')
        .eq('id', job.client_request_id)
        .single()
      
      if (request?.status !== 'Approved') {
        return { error: 'Cannot update. Client request must be approved first in Client Requests section.' }
      }
    }
  } catch (e) {
    console.log('client_request_id check skipped:', e)
  }

  const updateData: any = { status, progress }
  if (notes) updateData.notes = notes
  const { error } = await supabase
    .from('maintenance')
    .update(updateData)
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

export async function getMaintenance(page: number = 1, limit: number = 20) {
  const supabase = await createAdminClient()
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('maintenance')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('getMaintenance error:', error)
    return { data: [], total: 0 }
  }

  return { data: data || [], total: count || 0 }
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

export async function acceptRequestAsInstallation(requestId: string, data: {
  technician: string
  date: string
  time: string
  location: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: request, error: fetchError } = await supabase
    .from('client_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { error: 'Request not found' }
  }

  const insertData: any = {
    title: request.request_type,
    client_name: request.client_name,
    location: data.location || request.service_address || '',
    technician: data.technician,
    date: data.date,
    time: data.time,
    cost: data.cost,
    notes: data.notes || request.message,
    type: data.type || 'Standard',
    status: 'Scheduled',
    progress: 0
  }

  try {
    const { error: insertError } = await supabase
      .from('installations')
      .insert(insertData)

    if (insertError) {
      return { error: insertError.message }
    }
  } catch (e) {
    console.log('client_request_id column not available:', e)
  }

  await supabase
    .from('client_requests')
    .update({ status: 'Approved' })
    .eq('id', requestId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Request Accepted',
      message: `${request.client_name}'s request has been accepted. Installation job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function acceptRequestAsRepair(requestId: string, data: {
  technician: string
  date: string
  time: string
  location: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: request, error: fetchError } = await supabase
    .from('client_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { error: 'Request not found' }
  }

  const insertData: any = {
    title: request.request_type,
    client_name: request.client_name,
    location: data.location || request.service_address || '',
    technician: data.technician,
    date: data.date,
    time: data.time,
    cost: data.cost,
    notes: data.notes || request.message,
    type: data.type || 'Standard',
    status: 'Scheduled',
    progress: 0
  }

  try {
    const { error: insertError } = await supabase
      .from('repairs')
      .insert(insertData)

    if (insertError) {
      return { error: insertError.message }
    }
  } catch (e) {
    console.log('client_request_id column not available:', e)
  }

  await supabase
    .from('client_requests')
    .update({ status: 'Approved' })
    .eq('id', requestId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Request Accepted',
      message: `${request.client_name}'s request has been accepted. Repair job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function acceptRequestAsMaintenance(requestId: string, data: {
  technician: string
  date: string
  time: string
  location: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: request, error: fetchError } = await supabase
    .from('client_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { error: 'Request not found' }
  }

  const insertData: any = {
    title: request.request_type,
    client_name: request.client_name,
    location: data.location || request.service_address || '',
    technician: data.technician,
    date: data.date,
    time: data.time,
    cost: data.cost,
    notes: data.notes || request.message,
    type: data.type || 'Standard',
    status: 'Scheduled',
    progress: 0
  }

  try {
    const { error: insertError } = await supabase
      .from('maintenance')
      .insert(insertData)

    if (insertError) {
      return { error: insertError.message }
    }
  } catch (e) {
    console.log('client_request_id column not available:', e)
  }

  await supabase
    .from('client_requests')
    .update({ status: 'Approved' })
    .eq('id', requestId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Request Accepted',
      message: `${request.client_name}'s request has been accepted. Maintenance job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectRequest(requestId: string, reason?: string) {
  const supabase = await createAdminClient()
  
  const { data: request, error: fetchError } = await supabase
    .from('client_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { error: 'Request not found' }
  }

  const { error } = await supabase
    .from('client_requests')
    .update({ status: 'Rejected', message: reason ? `Rejected: ${reason}` : request.message })
    .eq('id', requestId)

  if (error) {
    return { error: error.message }
  }

  await supabase
    .from('notifications')
    .insert({
      title: 'Request Rejected',
      message: `${request.client_name}'s request has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function getAllPendingRequests() {
  const supabase = await createAdminClient()
  
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })

  const { data: requests, error: requestsError } = await supabase
    .from('client_requests')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })

  const pendingLeads = (leads || []).map(lead => ({
    ...lead,
    source: 'lead',
    displayDate: lead.preferred_date,
    displayTime: lead.preferred_time
  }))

  const pendingRequests = (requests || []).map(req => ({
    ...req,
    source: 'request',
    displayDate: req.preferred_date,
    displayTime: req.preferred_time
  }))

  return [...pendingLeads, ...pendingRequests].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
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
  const warrantyMonths = parseInt(formData.get('warrantyMonths') as string) || 12
  const warrantyType = formData.get('warrantyType') as string
  if (!clientId || !unitName || !brand || !unitType || !technology || !horsepower) {
    return { error: 'Please fill in all required fields.' }
  }

  let warrantyEndDate: string | null = null
  if (installationDate && warrantyMonths) {
    const endDate = new Date(installationDate)
    endDate.setMonth(endDate.getMonth() + warrantyMonths)
    warrantyEndDate = endDate.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('client_units')
    .insert({ 
      client_id: clientId, 
      unit_name: unitName, 
      brand, 
      unit_type: unitType, 
      technology, 
      horsepower, 
      indoor_serial: indoorSerial || null, 
      outdoor_serial: outdoorSerial || null, 
      installation_date: installationDate || null,
      warranty_months: warrantyMonths,
      warranty_type: warrantyType || 'Manufacturer',
      warranty_end_date: warrantyEndDate
    })
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
  const affectedUnitType = formData.get('affectedUnitType') as string
  const manualWarrantyClaim = formData.get('warrantyClaim') === 'on'
  const warrantyRefNumber = formData.get('warrantyRefNumber') as string
  const coveredBy = formData.get('coveredBy') as string
  if (!clientId) { return { error: 'Client is required.' } }

  // Auto-check warranty if not manually set
  let warrantyClaim = manualWarrantyClaim
  if (!manualWarrantyClaim && unitId) {
    const { data: unit } = await supabase
      .from('client_units')
      .select('warranty_end_date')
      .eq('id', unitId)
      .single()
    
    if (unit?.warranty_end_date) {
      const now = new Date()
      const end = new Date(unit.warranty_end_date)
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      warrantyClaim = daysLeft > 0
    }
  }

  let partsReplaced: any[] = []
  try { partsReplaced = partsJson ? JSON.parse(partsJson) : [] } catch { partsReplaced = [] }
  const { data, error } = await supabase
    .from('repair_jobs')
    .insert({ 
      unit_id: unitId || null, 
      client_id: clientId, 
      error_code: errorCode || null, 
      symptom: symptom || null, 
      parts_replaced: partsReplaced, 
      before_photo_url: beforePhotoUrl || null, 
      after_photo_url: afterPhotoUrl || null, 
      status: 'Open',
      affected_unit_type: affectedUnitType || null,
      warranty_claim: warrantyClaim,
      warranty_ref_number: warrantyRefNumber || null,
      covered_by: coveredBy || null
    })
    .select().single()
  if (error) { console.error('logRepairJob error:', error); return { error: error.message } }
  revalidatePath('/admin')
  return { success: true, job: data, warrantyClaim }
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

export async function getMaintenanceWithItems(page: number = 1, limit: number = 20) {
  const supabase = await createAdminClient()
  const offset = (page - 1) * limit
  
  try {
    // Get maintenance records with count
    const { data: maintenance, error, count } = await supabase
      .from('maintenance')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('getMaintenanceWithItems error:', error)
      return { data: [], total: 0, error: error.message }
    }
    
    if (!maintenance || maintenance.length === 0) {
      return { data: [], total: count || 0, error: null }
    }
    
    // Get all maintenance items for the fetched maintenance records (if table exists)
    let items: any[] = []
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('maintenance_items')
        .select('*, client_units(unit_name, brand, unit_type, technology, horsepower)')
        .in('maintenance_id', maintenance.map(m => m.id))
      
      if (itemsError) {
        console.log('maintenance_items query error:', itemsError.message)
      } else {
        items = itemsData || []
      }
    } catch (e) {
      console.log('maintenance_items table not ready yet')
    }
    
    // Attach items to maintenance records
    const maintenanceWithItems = maintenance.map(m => ({
      ...m,
      items: items.filter(item => item.maintenance_id === m.id)
    }))
    
    return { data: maintenanceWithItems, total: count || 0, error: null }
  } catch (e) {
    console.error('getMaintenanceWithItems fatal error:', e)
    return { data: [], total: 0, error: String(e) }
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

// --------------------------------------------------------------------
// CONVERT LEAD TO CLIENT - Convert corporate lead to client profile
// --------------------------------------------------------------------

export async function convertLeadToClient(leadId: string) {
  const supabase = await createAdminClient()
  
  // Get lead data
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()
  
  if (leadError || !lead) {
    return { error: 'Lead not found' }
  }
  
  // Generate temp password
  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: lead.email,
    password: tempPassword,
    email_confirm: true,
   user_metadata: {
      full_name: lead.client_type === 'Corporate' ? lead.company_name : lead.full_name
    }
  })
  
  if (authError) {
    console.error('convertLeadToClient: auth error:', authError)
    return { error: 'Failed to create user account' }
  }
  
  const userId = authData.user.id
  
  // Create client profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: lead.client_type === 'Corporate' ? lead.company_name : lead.full_name,
      email: lead.email,
      phone: lead.phone_number,
      role: 'client',
      client_type: lead.client_type,
      street: lead.street,
      barangay: lead.barangay,
      city: lead.city,
      zip_code: lead.zip_code,
      // Corporate fields
      company_name: lead.company_name,
      contact_person: lead.contact_person,
      building_name: lead.building_name,
      floor: lead.floor,
      province: lead.province,
    })
  
  if (profileError) {
    console.error('convertLeadToClient: profile error:', profileError)
    // Try to delete auth user
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Failed to create client profile' }
  }
  
  // Update lead status
  await supabase
    .from('leads')
    .update({ 
      status: 'Converted',
      converted_at: new Date().toISOString(),
      client_id: userId
    })
    .eq('id', leadId)
  
  // Send notification to new client
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Welcome! Your account is ready',
      message: lead.client_type === 'Corporate' 
        ? `Your company ${lead.company_name} is now a registered client. Login with: ${lead.email}`
        : `You are now a registered client. Login with: ${lead.email}`,
      type: 'update',
      link: '/dashboard'
    })
  
  revalidatePath('/admin')
  return { 
    success: true, 
    tempPassword,
    email: lead.email,
    message: `Client created! Temporary password: ${tempPassword}`
  }
}

// --------------------------------------------------------------------
// WARRANTY EXPIRY NOTIFICATIONS - Auto-notify and tag clients
// --------------------------------------------------------------------

export async function checkExpiringWarranties() {
  const supabase = await createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]

  // Get units with warranty expiring in next 7 days (not yet notified)
  const { data: expiringUnits, error } = await supabase
    .from('client_units')
    .select('*, profiles(id, full_name, email)')
    .lte('warranty_end_date', sevenDaysStr)
    .gte('warranty_end_date', today)

  if (error) {
    console.error('checkExpiringWarranties error:', error)
    return { notified: 0, error: error.message }
  }

  let notifiedCount = 0
  let taggedCount = 0

  for (const unit of expiringUnits || []) {
    const client = unit.profiles
    if (!client?.id) continue

    // Check if already notified today
    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', client.id)
      .eq('title', `Warranty Expiring: ${unit.unit_name}`)
      .gte('created_at', today)
      .single()

    if (!existingNotif) {
      const daysLeft = Math.ceil((new Date(unit.warranty_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      // Send notification
      await supabase.from('notifications').insert({
        user_id: client.id,
        title: 'Warranty Expiring Soon',
        message: `Your ${unit.brand} ${unit.unit_name} warranty expires in ${daysLeft} days. Please contact us to renew or extend your warranty.`,
        type: 'reminder',
        link: '/dashboard'
      })

      // Send email if email exists (requires email service)
      if (client.email) {
        console.log(`Would send expiry email to ${client.email} for unit ${unit.unit_name}`)
      }

      notifiedCount++
    }
  }

  // Get units with expired warranty (not tagged)
  const { data: expiredUnits, error: expiredError } = await supabase
    .from('client_units')
    .select('*, profiles(id, full_name)')
    .lt('warranty_end_date', today)
    .eq('warranty_type', 'Manufacturer')

  for (const unit of expiredUnits || []) {
    const client = unit.profiles
    if (!client?.id) continue

    // Check if already tagged
    const { data: existingTag } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', client.id)
      .eq('title', `Warranty Expired: ${unit.unit_name}`)
      .single()

    if (!existingTag) {
      // Tag as warranty expired
      await supabase.from('notifications').insert({
        user_id: client.id,
        title: 'Warranty Expired',
        message: `Your ${unit.brand} ${unit.unit_name} warranty has expired. Repairs may now be chargeable.`,
        type: 'update',
        link: '/dashboard'
      })

      taggedCount++
    }
  }

  revalidatePath('/admin')
  return { notified: notifiedCount, tagged: taggedCount }
}

// --------------------------------------------------------------------
// WARRANTY CHECK - Uses checkWarrantyStatus from utils.ts
// --------------------------------------------------------------------

export async function getUnitsWithWarrantyInfo(clientId: string) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('client_units')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUnitsWithWarrantyInfo error:', error)
    return []
  }

  return (data || []).map(unit => ({
    ...unit,
    warranty_info: checkWarrantyStatus(unit)
  }))
}

// --------------------------------------------------------------------
// MAINTENANCE REMINDERS - Auto-notify clients
// --------------------------------------------------------------------

export async function triggerMaintenanceReminders() {
  const supabase = await createAdminClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: settings } = await supabase
    .from('settings')
    .select('maintenance_reminder_enabled, maintenance_reminder_months')
    .eq('id', 'main')
    .single()

  if (!settings?.maintenance_reminder_enabled) {
    return { notified: 0, message: 'Reminders disabled' }
  }

  const reminderMonths = settings?.maintenance_reminder_months || 3
  const checkDate = new Date()
  checkDate.setMonth(checkDate.getMonth() + reminderMonths)
  const checkDateStr = checkDate.toISOString().split('T')[0]

  const { data: dueItems, error: queryError } = await supabase
    .from('maintenance_items')
    .select('*, client_units(unit_name, brand, technology, horsepower, client_id)')
    .lte('next_cleaning_date', checkDateStr)
    .gte('next_cleaning_date', today)
    .eq('status', 'Done')

  if (queryError) {
    console.error('Query error:', queryError)
    return { error: queryError.message }
  }

  let notifiedCount = 0

  for (const item of dueItems || []) {
    const clientId = item.client_units?.client_id
    const unitName = item.client_units?.unit_name
    const brand = item.client_units?.brand
    const hp = item.client_units?.horsepower

    if (!clientId) continue

    await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: 'Aircon Maintenance Due',
        message: `Your ${brand} ${unitName} (${hp}HP ${item.client_units?.technology}) is due for maintenance. Please schedule a maintenance appointment.`,
        type: 'reminder',
        link: '/dashboard'
      })

    notifiedCount++
  }

  revalidatePath('/admin')
  return { success: true, notified: notifiedCount }
}

// --------------------------------------------------------------------
// UNIT COMPONENTS - Serial number tracking per unit part
// --------------------------------------------------------------------

export async function createUnitComponent(formData: FormData) {
  const supabase = await createAdminClient()
  const clientUnitId = formData.get('clientUnitId') as string
  const componentType = formData.get('componentType') as string
  const serialNumber = formData.get('serialNumber') as string
  const positionIndex = parseInt(formData.get('positionIndex') as string) || 0

  if (!clientUnitId || !componentType) {
    return { error: 'Unit and component type are required.' }
  }

  if (serialNumber) {
    const { data: existing } = await supabase
      .from('unit_components')
      .select('id')
      .eq('serial_number', serialNumber)
      .single()
    if (existing) {
      return { error: 'Serial number already exists.' }
    }
  }

  const { data, error } = await supabase
    .from('unit_components')
    .insert({
      client_unit_id: clientUnitId,
      component_type: componentType,
      serial_number: serialNumber || null,
      position_index: positionIndex
    })
    .select()
    .single()

  if (error) {
    console.error('createUnitComponent error:', error)
    return { error: error.message }
  }
  revalidatePath('/admin')
  return { success: true, component: data }
}

export async function getUnitComponents(clientUnitId: string) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('unit_components')
    .select('*')
    .eq('client_unit_id', clientUnitId)
    .order('position_index', { ascending: true })

  if (error) {
    console.error('getUnitComponents error:', error)
    return []
  }
  return data || []
}

export async function updateUnitComponent(componentId: string, data: {
  component_type?: string
  serial_number?: string
  position_index?: number
}) {
  const supabase = await createAdminClient()

  if (data.serial_number) {
    const { data: existing } = await supabase
      .from('unit_components')
      .select('id')
      .eq('serial_number', data.serial_number)
      .neq('id', componentId)
      .single()
    if (existing) {
      return { error: 'Serial number already exists.' }
    }
  }

  const { error } = await supabase
    .from('unit_components')
    .update(data)
    .eq('id', componentId)

  if (error) {
    console.error('updateUnitComponent error:', error)
    return { error: error.message }
  }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUnitComponent(componentId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('unit_components')
    .delete()
    .eq('id', componentId)

  if (error) {
    console.error('deleteUnitComponent error:', error)
    return { error: error.message }
  }
  revalidatePath('/admin')
  return { success: true }
}
