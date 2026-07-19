'use server'

import { createClient, createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { validatePHPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils'
import { sendBookingConfirmationEmail, sendServiceEmail, sendClientMessageEmail } from '@/lib/email-service'

export async function signIn(prevState: any, formData: FormData) {
  try {
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

    if (error) {
      return { error: error.message }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    let userRole = profile?.role

    if (!profile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.email?.split('@')[0] || 'User',
          role: 'client'
        })

      if (profileError) {
        console.error('signIn: error creating profile:', profileError)
      } else {
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        if (newProfile) {
          userRole = newProfile.role
        }
      }
    }

    revalidatePath('/', 'layout')
    
    return { success: true, role: userRole }
  } catch (err: any) {
    console.error('signIn: unhandled error:', err)
    return { error: err?.message || 'An unexpected error occurred' }
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
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await adminSupabase
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
  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getProfile() {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    return null
  }

  const { data, error } = await adminSupabase
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
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalBookings: 0,
      activeServices: 0,
      completedServices: 0
    }
  }

  // Get user profile for client_name matching
  const { data: profile } = await adminSupabase.from('profiles').select('full_name').eq('id', user.id).single()
  const clientName = profile?.full_name || user.email?.split('@')[0]

  const { data: appointments, error } = await adminSupabase
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
  const activeServices = appointments?.filter(a => {
    const s = a.status?.toLowerCase()
    return s === 'scheduled' || s === 'in_progress' || s === 'pending'
  }).length || 0
  const completedServices = appointments?.filter(a => {
    const s = a.status?.toLowerCase()
    return s === 'completed' || s === 'finished'
  }).length || 0

  // Also check installations and repairs for more accurate counts
  const { data: installations } = await adminSupabase
    .from('installations')
    .select('status')
    .eq('client_name', clientName)

  const { data: repairs } = await adminSupabase
    .from('repairs')
    .select('status')
    .eq('client_name', clientName)

  const totalInstallations = installations?.length || 0
  const totalRepairs = repairs?.length || 0
  const activeInstallations = installations?.filter(i => {
    const s = i.status?.toLowerCase()
    return s === 'scheduled' || s === 'in_progress' || s === 'pending'
  }).length || 0
  const completedInstallations = installations?.filter(i => {
    const s = i.status?.toLowerCase()
    return s === 'completed' || s === 'finished'
  }).length || 0
  const activeRepairs = repairs?.filter(r => {
    const s = r.status?.toLowerCase()
    return s === 'scheduled' || s === 'in_progress' || s === 'pending'
  }).length || 0
  const completedRepairs = repairs?.filter(r => {
    const s = r.status?.toLowerCase()
    return s === 'completed' || s === 'finished'
  }).length || 0

  return {
    totalBookings: totalBookings + totalInstallations + totalRepairs,
    activeServices: activeServices + activeInstallations + activeRepairs,
    completedServices: completedServices + completedInstallations + completedRepairs
  }
}

export async function getUserActivity(limit: number = 20) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get user profile for client_name matching
  const { data: profile } = await adminSupabase.from('profiles').select('full_name').eq('id', user.id).single()
  const clientName = profile?.full_name || user.email?.split('@')[0]

  // Fetch appointments by email, installations/repairs/maintenance by client_name (with limits)
  const [appointmentsRes, installationsRes, repairsRes, maintenanceRes] = await Promise.all([
    adminSupabase.from('appointments').select('*').eq('email', user.email).order('created_at', { ascending: false }).limit(limit),
    adminSupabase.from('installations').select('*').eq('client_name', clientName).order('created_at', { ascending: false }).limit(limit),
    adminSupabase.from('repairs').select('*').eq('client_name', clientName).order('created_at', { ascending: false }).limit(limit),
    adminSupabase.from('maintenance').select('*').eq('client_name', clientName).order('created_at', { ascending: false }).limit(limit)
  ])

  const appointments = (appointmentsRes.data || []).map(a => ({ ...a, table: 'appointments' }))
  const installations = (installationsRes.data || []).map(i => ({ ...i, service_type: 'Installation', table: 'installations' }))
  const repairs = (repairsRes.data || []).map(r => ({ ...r, service_type: r.title, table: 'repairs' }))
  const maintenance = (maintenanceRes.data || []).map(m => ({ ...m, service_type: 'Maintenance', table: 'maintenance' }))

  // Combine and sort by date
  const allActivities = [...appointments, ...installations, ...repairs, ...maintenance]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return allActivities
}

export async function requestService(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
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

  // Check max 3 bookings per day
  const activeStatuses = ['pending', 'Scheduled', 'In Progress', 'Rescheduled']
  const [apptCount, instCount, repCount, maintCount] = await Promise.all([
    adminSupabase.from('appointments').select('id', { count: 'exact', head: true }).eq('date', date).in('status', activeStatuses),
    adminSupabase.from('installations').select('id', { count: 'exact', head: true }).eq('date', date).in('status', activeStatuses),
    adminSupabase.from('repairs').select('id', { count: 'exact', head: true }).eq('date', date).in('status', activeStatuses),
    adminSupabase.from('maintenance').select('id', { count: 'exact', head: true }).eq('date', date).in('status', activeStatuses),
  ])
  const totalCount = (apptCount.count || 0) + (instCount.count || 0) + (repCount.count || 0) + (maintCount.count || 0)
  if (totalCount >= 3) {
    return { error: 'This date is fully booked. Please select another date.' }
  }

  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const clientName = profile?.full_name || user.email?.split('@')[0] || 'Unknown'

  // Get selected units if any
  const selectedUnitsJson = formData.get('selectedUnits') as string
  let selectedUnitIds: string[] = []
  let selectedUnitsData: any[] = []
  
  if (selectedUnitsJson) {
    try {
      selectedUnitIds = JSON.parse(selectedUnitsJson)
      if (selectedUnitIds.length > 0) {
        const { data: units } = await adminSupabase
          .from('client_units')
          .select('*')
          .in('id', selectedUnitIds)
        selectedUnitsData = units || []
      }
    } catch (e) {
      console.error('Error parsing selectedUnits:', e)
    }
  }

  const isMultiUnit = selectedUnitsData.length > 1

  // Insert into appointments using admin client
  const { error: appointmentError } = await adminSupabase
    .from('appointments')
    .insert({
      client_name: clientName,
      email: user.email,
      phone,
      address,
      date,
      time,
      service_type: serviceType,
      notes: notes || (isMultiUnit ? `Multi-unit service for ${selectedUnitsData.length} units` : ''),
      status: 'pending'
    })

  if (appointmentError) {
    console.error('requestService: error inserting appointment:', appointmentError)
    return { error: appointmentError.message }
  }

  // Create client request record for admin
  await adminSupabase
    .from('client_requests')
    .insert({
      client_id: user.id,
      client_name: clientName,
      request_type: serviceType,
      message: notes,
      preferred_date: date,
      preferred_time: time,
      service_address: address || null,
      phone_number: phone || null
    })

  // Create notification for admin with detailed information
  let detailedMessage = `${clientName} has requested a ${serviceType} service.\n` +
    `Phone: ${phone}\n` +
    `Date: ${date} at ${time}\n` +
    `Address: ${address || 'Not specified'}\n`

  if (selectedUnitsData.length > 0) {
    detailedMessage += `Units: ${selectedUnitsData.map(u => `${u.unit_name} (${u.brand} ${u.unit_type} ${u.horsepower}HP)`).join(', ')}\n`
  }
  
  if (notes) {
    detailedMessage += `Details: ${notes}`
  }

  const { error: notifError } = await adminSupabase
    .from('notifications')
    .insert({
      title: `New ${serviceType} Service Request`,
      message: detailedMessage,
      type: 'request',
      link: '/admin',
      is_read: false
    })

  if (notifError) {
    console.error('Failed to create notification:', notifError)
  }

  // Send booking confirmation email to client
  if (user.email) {
    sendBookingConfirmationEmail({
      to: user.email,
      customerName: clientName,
      serviceType: serviceType,
      preferredDate: date,
      preferredTime: time
    }).catch(console.error)
  }

  // Send notification to admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    sendClientMessageEmail({
      to: adminEmail,
      clientName: clientName,
      clientEmail: user.email || '',
      subject: `New ${serviceType} Service Request`,
      message: `Client: ${clientName}\nEmail: ${user.email}\nPhone: ${phone}\nService: ${serviceType}\nDate: ${date}\nTime: ${time}\nAddress: ${address || 'Not specified'}\nNotes: ${notes || 'None'}`
    }).catch(console.error)
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}

export async function rescheduleService(appointmentId: string, newDate: string, newTime: string, serviceType: string) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const tableMap: Record<string, string> = {
    'Installation': 'installations',
    'Repair': 'repairs',
    'Maintenance': 'maintenance',
    'Cleaning': 'maintenance',
    'Inspection': 'maintenance'
  }
  
  const table = tableMap[serviceType] || 'appointments'
  
  const { data: appointment, error: fetchError } = await adminSupabase
    .from(table)
    .select('*')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Appointment not found' }
  }

  const originalDateTime = new Date(`${appointment.date}T${appointment.time?.split(' - ')[0] || '12:00'}`)
  const threeHoursBefore = new Date(originalDateTime.getTime() - (3 * 60 * 60 * 1000))
  const now = new Date()

  if (now >= threeHoursBefore) {
    return { error: 'Rescheduling is only allowed up to 3 hours before the original scheduled time' }
  }

  const { data: existingBooking } = await adminSupabase
    .from('appointments')
    .select('id')
    .eq('date', newDate)
    .eq('time', newTime)
    .neq('status', 'cancelled')
    .single()

  if (existingBooking) {
    return { error: 'This time slot is already booked' }
  }

  const newRescheduleCount = (appointment.reschedule_count || 0) + 1

  const { error: updateError } = await adminSupabase
    .from(table)
    .update({ 
      date: newDate, 
      time: newTime,
      reschedule_count: newRescheduleCount,
      status: 'Rescheduled'
    })
    .eq('id', appointmentId)

  if (updateError) {
    return { error: updateError.message }
  }

  await adminSupabase
    .from('notifications')
    .insert({
      title: 'Service Rescheduled',
      message: `Service has been rescheduled to ${newDate} at ${newTime}`,
      type: 'info',
      user_id: user.id
    })

  // Send rescheduled email directly (no fetch-to-self)
  const { data: profileData } = await adminSupabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  if (profileData?.email) {
    sendServiceEmail({
      type: 'delayed',
      to: profileData.email,
      customerName: profileData.full_name || 'Client',
      serviceType: serviceType,
      date: newDate,
      time: newTime,
      reason: 'Rescheduled by client'
    }).catch(console.error)
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    sendServiceEmail({
      type: 'delayed',
      to: adminEmail,
      customerName: `Admin Notification — ${profileData?.full_name || 'Client'} rescheduled`,
      serviceType: serviceType,
      date: newDate,
      time: newTime,
      reason: 'Rescheduled by client'
    }).catch(console.error)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelService(appointmentId: string, serviceType: string) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const tableMap: Record<string, string> = {
    'Installation': 'installations',
    'Repair': 'repairs',
    'Maintenance': 'maintenance',
    'Cleaning': 'maintenance',
    'Inspection': 'maintenance'
  }

  const table = tableMap[serviceType] || 'appointments'

  const { data: appointment, error: fetchError } = await adminSupabase
    .from(table)
    .select('*')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Appointment not found' }
  }

  const originalDateTime = new Date(`${appointment.date}T${appointment.time?.split(' - ')[0] || '12:00'}`)
  const threeHoursBefore = new Date(originalDateTime.getTime() - (3 * 60 * 60 * 1000))
  const now = new Date()

  if (now >= threeHoursBefore) {
    return { error: 'Cancellation is only allowed up to 3 hours before the scheduled time' }
  }

  const { error: updateError } = await adminSupabase
    .from(table)
    .update({ status: 'Cancelled' })
    .eq('id', appointmentId)

  if (updateError) {
    return { error: updateError.message }
  }

  await adminSupabase
    .from('notifications')
    .insert({
      title: 'Service Cancelled',
      message: `Your ${serviceType} has been cancelled.`,
      type: 'cancelled',
      user_id: user.id
    })

  // Notify client
  const { data: profileData } = await adminSupabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  if (profileData?.email) {
    sendServiceEmail({
      type: 'cancelled',
      to: profileData.email,
      customerName: profileData.full_name || 'Client',
      serviceType: serviceType,
      date: appointment.date,
      time: appointment.time,
      reason: 'Cancelled by client'
    }).catch(console.error)
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    sendServiceEmail({
      type: 'cancelled',
      to: adminEmail,
      customerName: `Cancellation Alert — ${profileData?.full_name || 'Client'} cancelled`,
      serviceType: serviceType,
      date: appointment.date,
      time: appointment.time,
      reason: 'Cancelled by client'
    }).catch(console.error)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  if (phone && !validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  const { error } = await adminSupabase
    .from('profiles')
    .update({ 
      full_name: fullName,
      phone: phone,
      address: address 
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile error:', error)
    return { error: error.message }
  }

  try {
    revalidatePath('/dashboard')
  } catch (e) {
    console.error('revalidatePath error:', e)
  }
  return { success: true }
}

export async function getUserMaintenanceWithItems() {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get user's profile to match by client_name
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const clientName = profile?.full_name

  // Get maintenance records for this client
  const { data: maintenance, error } = await adminSupabase
    .from('maintenance')
    .select('*')
    .eq('client_name', clientName)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserMaintenanceWithItems error:', error)
    return []
  }

  // Get all maintenance items if there are maintenance records
  let items: any[] = []
  if (maintenance && maintenance.length > 0) {
    const { data: itemsData } = await adminSupabase
      .from('maintenance_items')
      .select('*, client_units(unit_name, brand, unit_type, technology, horsepower)')
      .in('maintenance_id', (maintenance || []).map(m => m.id))
    items = itemsData || []
  }

  // Attach items to maintenance records
  const maintenanceWithItems = (maintenance || []).map(m => ({
    ...m,
    items: items.filter((item: any) => item.maintenance_id === m.id)
  }))

  return maintenanceWithItems
}

export async function getUserClientUnits() {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Query by client_id (more reliable) or client_name as fallback
  const { data: units, error } = await adminSupabase
    .from('client_units')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserClientUnits error:', error)
    return []
  }

  return units || []
}

export async function getUserUnitServiceHistory(unitId: string) {
  try {
    const adminSupabase = await createAdminClient()
    
    const history: any[] = []

    const { data: unitData } = await adminSupabase
      .from('client_units')
      .select('*, profiles!inner(full_name)')
      .eq('id', unitId)
      .single()
    
    const clientName = unitData?.profiles?.full_name
    
    try {
      const { data: maintenanceItems } = await adminSupabase
        .from('maintenance_items')
        .select('*, maintenance!inner(id, title, date, status, client_name)')
        .eq('unit_id', unitId)
      
      if (maintenanceItems) {
        history.push(...maintenanceItems.map((item: any) => ({
          type: 'Maintenance',
          title: item.maintenance?.title || 'Maintenance Service',
          date: item.completed_at || item.created_at,
          status: item.status,
          notes: item.notes
        })))
      }
    } catch {}

    if (clientName) {
      try {
        const { data: repairs } = await adminSupabase
          .from('repairs')
          .select('*')
          .eq('client_name', clientName)
        
        if (repairs) {
          history.push(...repairs.map((item: any) => ({
            type: 'Repair',
            title: item.title || 'Aircon Repair',
            date: item.date || item.created_at,
            status: item.status,
            notes: item.notes
          })))
        }
      } catch {}

      try {
        const { data: repairJobs } = await adminSupabase
          .from('repair_jobs')
          .select('*')
          .eq('unit_id', unitId)
        
        if (repairJobs) {
          history.push(...repairJobs.map((item: any) => ({
            type: 'Repair',
            title: item.symptom || 'Aircon Repair',
            date: item.created_at,
            status: item.status,
            notes: item.parts_replaced ? `Parts: ${item.parts_replaced.map((p: any) => p.name).join(', ')}` : null
          })))
        }
      } catch {}
    }

    history.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

    return history
  } catch (error) {
    console.error('getUserUnitServiceHistory error:', error)
    return []
  }
}

export async function sendMessageToAdmin(subject: string, message: string) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  const { error: notifError } = await adminSupabase
    .from('notifications')
    .insert({
      title: `Message from ${profile.full_name}: ${subject}`,
      message: message,
      type: 'message',
      link: '/admin'
    })

  if (notifError) {
    console.error('Notification insert error:', notifError)
  }

  const { data: adminUsers } = await adminSupabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'admin')

  if (!adminUsers || adminUsers.length === 0) {
    return { error: 'No admin users found' }
  }

  sendClientMessageEmail({
    to: adminUsers[0].email,
    clientName: profile.full_name,
    clientEmail: profile.email,
    subject,
    message
  }).catch(err => console.error('Email send failed:', err))

  revalidatePath('/dashboard')
  return { success: true }
}
