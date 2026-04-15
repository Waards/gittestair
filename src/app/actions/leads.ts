'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { 
  sanitizedName, 
  sanitizedPhone, 
  sanitizedEmail, 
  sanitizedString,
  validateAndSanitizeLead
} from '@/lib/security'

export async function submitLead(formData: FormData) {
  const supabase = await createAdminClient()

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const street = formData.get('street') as string
  const barangay = formData.get('barangay') as string
  const city = formData.get('city') as string
  const zipCode = formData.get('zipCode') as string
  const serviceAddress = formData.get('serviceAddress') as string || `${street}, ${barangay}, ${city} ${zipCode ? ', ' + zipCode : ''}`
  const clientType = formData.get('clientType') as string
  const serviceType = formData.get('serviceType') as string
  const preferredDate = formData.get('preferredDate') as string
  const preferredTime = formData.get('preferredTime') as string
  const additionalInfo = formData.get('additionalInfo') as string

  if (!fullName || !phone || !email || !street || !barangay || !city || !clientType || !serviceType || !preferredDate || !preferredTime) {
    return { error: 'Please fill in all required fields' }
  }

  const sanitizedFullName = sanitizedName(fullName)
  const sanitizedPhoneNum = sanitizedPhone(phone)
  const sanitizedEmailAddr = sanitizedEmail(email)
  const sanitizedStreet = sanitizedString(street)
  const sanitizedBarangay = sanitizedString(barangay)
  const sanitizedCity = sanitizedString(city)
  const sanitizedZipCode = sanitizedString(zipCode)
  const sanitizedServiceType = sanitizedString(serviceType)
  const sanitizedAdditionalInfo = sanitizedString(additionalInfo || '')

  if (!sanitizedFullName || !sanitizedEmailAddr || !sanitizedStreet || !sanitizedBarangay || !sanitizedCity) {
    return { error: 'Invalid input detected. Please check your entries.' }
  }

  const validation = validateAndSanitizeLead({
    fullName: sanitizedFullName,
    phone: sanitizedPhoneNum,
    email: sanitizedEmailAddr,
    serviceAddress: `${sanitizedStreet}, ${sanitizedBarangay}, ${sanitizedCity}${sanitizedZipCode ? ' ' + sanitizedZipCode : ''}`,
    clientType,
    serviceType: sanitizedServiceType,
    preferredDate,
    preferredTime,
    additionalInfo: sanitizedAdditionalInfo,
  })

  if (!validation.success || !validation.data) {
    return { error: validation.error || 'Validation failed' }
  }

  const { count: appointmentsCount, error: apptError } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('date', preferredDate)

  const { count: leadsCount, error: leadsError } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('preferred_date', preferredDate)
    .neq('status', 'Cancelled')

  if (apptError || leadsError) {
    console.error('Error checking availability:', apptError || leadsError)
    return { error: 'Failed to verify booking availability. Please try again later.' }
  }

  const totalBookings = (appointmentsCount || 0) + (leadsCount || 0)
  
  if (totalBookings >= 4) {
    return { error: 'This date is fully booked (Max 4 bookings). Please select another day.' }
  }

  const { error } = await supabase
    .from('leads')
    .insert({
      ...validation.data,
      street: sanitizedStreet,
      barangay: sanitizedBarangay,
      city: sanitizedCity,
      zip_code: sanitizedZipCode || null,
    })

  if (error) {
    console.error('submitLead: error inserting lead:', error)
    return { error: error.message }
  }

  await supabase
    .from('notifications')
    .insert({
      title: 'New Lead Generated',
      message: `${sanitizedFullName} has submitted a booking request via landing page.`,
      type: 'request',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function getLeads() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getLeads: error fetching leads:', error)
    return []
  }

  return data || []
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)

  if (error) {
    console.error('updateLeadStatus: error updating lead:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function acceptLead(leadId: string, data: {
  serviceType: string
  technician: string
  date: string
  time: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (fetchError || !lead) {
    return { error: 'Lead not found' }
  }

  const { error: insertError } = await supabase
    .from('installations')
    .insert({
      title: data.serviceType,
      client_name: lead.full_name,
      location: lead.service_address,
      technician: data.technician,
      date: data.date,
      time: data.time,
      cost: data.cost,
      notes: data.notes || lead.additional_info,
      type: data.type || 'Standard',
      status: 'Scheduled',
      progress: 0
    })

  if (insertError) {
    console.error('acceptLead: error creating installation:', insertError)
    return { error: insertError.message }
  }

  await supabase
    .from('leads')
    .update({ status: 'Accepted' })
    .eq('id', leadId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Accepted',
      message: `${lead.full_name}'s request has been accepted. ${data.serviceType} job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function acceptLeadAsRepair(leadId: string, data: {
  serviceType: string
  technician: string
  date: string
  time: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (fetchError || !lead) {
    return { error: 'Lead not found' }
  }

  const { error: insertError } = await supabase
    .from('repairs')
    .insert({
      title: data.serviceType,
      client_name: lead.full_name,
      location: lead.service_address,
      technician: data.technician,
      date: data.date,
      time: data.time,
      cost: data.cost,
      notes: data.notes || lead.additional_info,
      type: data.type || 'Standard',
      status: 'Scheduled',
      progress: 0
    })

  if (insertError) {
    console.error('acceptLeadAsRepair: error creating repair:', insertError)
    return { error: insertError.message }
  }

  await supabase
    .from('leads')
    .update({ status: 'Accepted' })
    .eq('id', leadId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Accepted',
      message: `${lead.full_name}'s request has been accepted. Repair job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function acceptLeadAsMaintenance(leadId: string, data: {
  serviceType: string
  technician: string
  date: string
  time: string
  cost: string
  notes: string
  type: string
}) {
  const supabase = await createAdminClient()
  
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (fetchError || !lead) {
    return { error: 'Lead not found' }
  }

  const { error: insertError } = await supabase
    .from('maintenance')
    .insert({
      title: data.serviceType,
      client_name: lead.full_name,
      location: lead.service_address,
      technician: data.technician,
      date: data.date,
      time: data.time,
      cost: data.cost,
      notes: data.notes || lead.additional_info,
      type: data.type || 'Standard',
      status: 'Scheduled',
      progress: 0
    })

  if (insertError) {
    console.error('acceptLeadAsMaintenance: error creating maintenance:', insertError)
    return { error: insertError.message }
  }

  await supabase
    .from('leads')
    .update({ status: 'Accepted' })
    .eq('id', leadId)

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Accepted',
      message: `${lead.full_name}'s request has been accepted. Maintenance job created.`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectLead(leadId: string, reason?: string) {
  const supabase = await createAdminClient()
  
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (fetchError || !lead) {
    return { error: 'Lead not found' }
  }

  const { error } = await supabase
    .from('leads')
    .update({ status: 'Rejected', additional_info: reason ? `Rejected: ${reason}` : lead.additional_info })
    .eq('id', leadId)

  if (error) {
    console.error('rejectLead: error rejecting lead:', error)
    return { error: error.message }
  }

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Rejected',
      message: `${lead.full_name}'s request has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'info',
      link: '/admin'
    })

  revalidatePath('/admin')
  return { success: true }
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createAdminClient()
  
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (fetchError || !lead) {
    console.error('convertLeadToClient: error fetching lead:', fetchError)
    return { error: 'Lead not found' }
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (existingProfile) {
    return { error: 'A client with this email already exists' }
  }

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const password = generatePassword()
  const clientUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: lead.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: lead.full_name,
      role: 'client'
    }
  })

  if (authError) {
    console.error('convertLeadToClient: error creating auth user:', authError)
    return { error: authError.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone_number,
      address: lead.service_address,
      client_type: lead.client_type,
      role: 'client',
      password
    })

  if (profileError) {
    console.error('convertLeadToClient: error creating profile:', profileError)
    return { error: profileError.message }
  }

  const { error: convertError } = await supabase
    .from('leads')
    .update({ status: 'Converted' })
    .eq('id', leadId)

  if (convertError) {
    console.error('convertLeadToClient: error updating lead status:', convertError)
  }

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Converted to Client',
      message: `${lead.full_name} has been added as a client.`,
      type: 'info',
      link: '/admin'
    })

  await supabase
    .from('notifications')
    .insert({
      title: 'Welcome to Aircon Pro Services!',
      message: `Your account has been created. Login at ${clientUrl} with password: ${password}`,
      type: 'reminder',
      user_id: authData.user.id
    })

  revalidatePath('/admin')
  return { success: true, password, email: lead.email }
}

export async function deleteLead(leadId: string) {
  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)

  if (error) {
    console.error('deleteLead: error deleting lead:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
