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
import { sendFCMNotification } from '@/lib/fcm-service'
import { sendWelcomeEmail, sendBookingConfirmationEmail, sendClientMessageEmail } from '@/lib/email-service'

export async function submitLead(formData: FormData) {
  const supabase = await createAdminClient()

  const fullName = formData.get('fullName') as string
  const firstName = formData.get('firstName') as string
  const middleName = formData.get('middleName') as string
  const lastName = formData.get('lastName') as string
  const suffix = formData.get('suffix') as string
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
  // Aircon specification fields
  const airconBrand = formData.get('airconBrand') as string
  const airconType = formData.get('airconType') as string
  const horsepower = formData.get('horsepower') as string
  if (!phone || !email || !street || !barangay || !city || !clientType || !serviceType || !preferredDate || !preferredTime) {
    return { error: 'Please fill in all required fields' }
  }

  if (clientType !== 'Corporate' && (!firstName || !lastName)) {
    return { error: 'Please fill in first name and last name' }
  }

  const sanitizedFullName = sanitizedName(fullName)
  const sanitizedFirstName = sanitizedName(firstName)
  const sanitizedMiddleName = sanitizedName(middleName)
  const sanitizedLastName = sanitizedName(lastName)
  const sanitizedSuffix = sanitizedName(suffix)
  const sanitizedPhoneNum = sanitizedPhone(phone)
  const sanitizedEmailAddr = sanitizedEmail(email)
  const sanitizedStreet = sanitizedString(street)
  const sanitizedBarangay = sanitizedString(barangay)
  const sanitizedCity = sanitizedString(city)
  const sanitizedZipCode = sanitizedString(zipCode)
  const sanitizedServiceType = sanitizedString(serviceType)
  const sanitizedAdditionalInfo = sanitizedString(additionalInfo || '')
  const sanitizedAirconBrand = sanitizedString(airconBrand || '')
  const sanitizedAirconType = sanitizedString(airconType || '')
  const sanitizedHorsepower = sanitizedString(horsepower || '')
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

  // Get corporate fields
  const companyName = formData.get('companyName') as string
  const contactPerson = formData.get('contactPerson') as string
  const buildingName = formData.get('buildingName') as string
  const floor = formData.get('floor') as string
  const province = formData.get('province') as string
  const designation = formData.get('designation') as string
  const numberOfUnits = formData.get('numberOfUnits') as string
  const specialInstructions = formData.get('specialInstructions') as string

  const sanitizedCompanyName = sanitizedString(companyName || '')
  const sanitizedContactPerson = sanitizedString(contactPerson || '')
  const sanitizedBuildingName = sanitizedString(buildingName || '')
  const sanitizedFloor = sanitizedString(floor || '')
  const sanitizedProvince = sanitizedString(province || '')
  const sanitizedDesignation = sanitizedString(designation || '')
  const sanitizedNumberOfUnits = numberOfUnits ? parseInt(numberOfUnits) || null : null
  const sanitizedSpecialInstructions = sanitizedString(specialInstructions || '')

  const { error } = await supabase
    .from('leads')
    .insert({
      ...validation.data,
      street: sanitizedStreet,
      barangay: sanitizedBarangay,
      city: sanitizedCity,
      zip_code: sanitizedZipCode || null,
      province: sanitizedProvince || null,
      aircon_brand: sanitizedAirconBrand || null,
      aircon_type: sanitizedAirconType || null,
      horsepower: sanitizedHorsepower || null,
      unit_brand_type: (sanitizedAirconBrand && sanitizedAirconType) ? `${sanitizedAirconBrand} ${sanitizedAirconType}` : null,
      first_name: sanitizedFirstName || null,
      middle_name: sanitizedMiddleName || null,
      last_name: sanitizedLastName || null,
      suffix: sanitizedSuffix || null,
      company_name: clientType === 'Corporate' ? sanitizedCompanyName : null,
      contact_person: sanitizedContactPerson || null,
      building_name: sanitizedBuildingName || null,
      floor: sanitizedFloor || null,
      designation: sanitizedDesignation || null,
      number_of_units: sanitizedNumberOfUnits,
      special_instructions: sanitizedSpecialInstructions || null,
      inspection_required: clientType === 'Corporate',
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

  // Send booking confirmation email to client
  sendBookingConfirmationEmail({
    to: sanitizedEmailAddr,
    customerName: sanitizedFullName,
    serviceType: sanitizedServiceType,
    preferredDate,
    preferredTime
  }).catch(console.error)

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    sendClientMessageEmail({
      to: adminEmail,
      clientName: sanitizedFullName,
      clientEmail: sanitizedEmailAddr,
      subject: `New ${sanitizedServiceType} Booking Request (Lead)`,
      message: `Client: ${sanitizedFullName}\nEmail: ${sanitizedEmailAddr}\nPhone: ${sanitizedPhoneNum}\nService: ${sanitizedServiceType}\nDate: ${preferredDate}\nTime: ${preferredTime}\nAddress: ${validation.data.service_address || 'Not specified'}\nNotes: ${sanitizedAdditionalInfo || 'None'}`
    }).catch(console.error)
  }

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

export async function getCorporateLeads() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .or('client_type.eq.Corporate,inspection_required.eq.true')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getCorporateLeads: error fetching corporate leads:', error)
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (profile?.id) {
    const { data: fcmToken } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', profile.id)
      .single()

    if (fcmToken?.token) {
      sendFCMNotification(
        fcmToken.token,
        'Booking Confirmed!',
        `Your ${data.serviceType} has been scheduled for ${data.date}.`,
        { type: 'booking', jobId: leadId }
      ).catch(console.error)
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        title: 'Booking Confirmed!',
        message: `Your ${data.serviceType} has been scheduled for ${data.date} at ${data.time}.`,
        type: 'booking',
        link: '/dashboard'
      })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', profile.id)
      .single()

    if (profileData?.email) {
      sendBookingConfirmationEmail({
        to: profileData.email,
        customerName: profileData.full_name,
        serviceType: data.serviceType,
        preferredDate: data.date,
        preferredTime: data.time
      }).catch(console.error)
    }
  }

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (profile?.id) {
    const { data: fcmToken } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', profile.id)
      .single()

    if (fcmToken?.token) {
      sendFCMNotification(
        fcmToken.token,
        'Booking Confirmed!',
        `Your repair has been scheduled for ${data.date}.`,
        { type: 'booking', jobId: leadId }
      ).catch(console.error)
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        title: 'Booking Confirmed!',
        message: `Your repair has been scheduled for ${data.date} at ${data.time}.`,
        type: 'booking',
        link: '/dashboard'
      })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', profile.id)
      .single()

    if (profileData?.email) {
      sendBookingConfirmationEmail({
        to: profileData.email,
        customerName: profileData.full_name,
        serviceType: data.serviceType,
        preferredDate: data.date,
        preferredTime: data.time
      }).catch(console.error)
    }
  }

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (profile?.id) {
    const { data: fcmToken } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', profile.id)
      .single()

    if (fcmToken?.token) {
      sendFCMNotification(
        fcmToken.token,
        'Booking Confirmed!',
        `Your maintenance has been scheduled for ${data.date}.`,
        { type: 'booking', jobId: leadId }
      ).catch(console.error)
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        title: 'Booking Confirmed!',
        message: `Your maintenance has been scheduled for ${data.date} at ${data.time}.`,
        type: 'booking',
        link: '/dashboard'
      })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', profile.id)
      .single()

    if (profileData?.email) {
      sendBookingConfirmationEmail({
        to: profileData.email,
        customerName: profileData.full_name,
        serviceType: data.serviceType,
        preferredDate: data.date,
        preferredTime: data.time
      }).catch(console.error)
    }
  }

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
      first_name: lead.first_name,
      middle_name: lead.middle_name,
      last_name: lead.last_name,
      suffix: lead.suffix,
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

  // Create client request record for admin to approve
  await supabase
    .from('client_requests')
    .insert({
      client_id: authData.user.id,
      client_name: lead.full_name,
      request_type: lead.service_type || '',
      message: lead.additional_info || '',
      preferred_date: lead.preferred_date || null,
      preferred_time: lead.preferred_time || null,
      service_address: lead.service_address || null,
      phone_number: lead.phone_number || null,
      status: 'Pending'
    })

  await supabase
    .from('notifications')
    .insert({
      title: 'Lead Converted to Client',
      message: `${lead.full_name} has been added as a client with a pending service request.`,
      type: 'info',
      link: '/admin'
    })

  await supabase
    .from('notifications')
    .insert({
      title: 'Welcome to Azalea Aircon Services!',
      message: `Your account has been created. Login at ${clientUrl} with password: ${password}`,
      type: 'reminder',
      user_id: authData.user.id
    })

  sendWelcomeEmail({
    to: lead.email,
    customerName: lead.full_name,
    password
  }).catch(console.error)

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
