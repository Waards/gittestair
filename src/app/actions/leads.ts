'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const validatePHPhone = (phone: string): boolean => {
  const phRegex = /^09\d{9}$/;
  return phRegex.test(phone);
};

const PHONE_VALIDATION_ERROR = "Phone number must be a valid Philippines number (e.g., 09123456789) and maximum 11 digits.";

export async function submitLead(formData: FormData) {
  const supabase = await createAdminClient()

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const serviceAddress = formData.get('serviceAddress') as string
  const clientType = formData.get('clientType') as string
  const serviceType = formData.get('serviceType') as string
  const preferredDate = formData.get('preferredDate') as string
  const preferredTime = formData.get('preferredTime') as string
  const additionalInfo = formData.get('additionalInfo') as string
  const unitBrandType = formData.get('unitBrandType') as string | null

  // Validation
  if (!fullName || !phone || !email || !serviceAddress || !clientType || !serviceType || !preferredDate || !preferredTime) {
    return { error: 'Please fill in all required fields' }
  }

  if (!validatePHPhone(phone)) {
    return { error: PHONE_VALIDATION_ERROR }
  }

  // Enforce Max Bookings per day (Maximum 4 bookings)
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
      full_name: fullName,
      phone_number: phone,
      email,
      service_address: serviceAddress,
      client_type: clientType,
      service_type: serviceType,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      additional_info: additionalInfo,
      // unit_brand_type is not present in schema for this project setup,
      // so we store brand/type details inside additional_info instead.
      status: 'Pending'
    })

  if (error) {
    console.error('submitLead: error inserting lead:', error)
    return { error: error.message }
  }

  // Create notification for admin
  await supabase
    .from('notifications')
    .insert({
      title: 'New Lead Generated',
      message: `${fullName} has submitted a booking request via landing page.`,
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
