import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const brandColors = {
  primary: '#005596',
  secondary: '#0062a3',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  light: '#f8fafc'
}

const companyName = 'Azalea Aircon Services'

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Azalea Aircon Services</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${brandColors.light};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${brandColors.light}; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Azalea Aircon Services</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Professional Aircon Services</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                ${content}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  This is an automated message from <strong style="color: ${brandColors.primary};">Azalea Aircon Services</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px;">
                  For inquiries, contact us at support@airconone.com
                </p>
              </td>
            </tr>
          </table>
          
          <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} Azalea Aircon Services. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`

export async function sendServiceEmail(data: {
  type: 'complete' | 'delayed' | 'cancelled'
  to: string
  customerName: string
  serviceType: string
  unitName?: string
  brand?: string
  date?: string
  time?: string
  notes?: string
  reason?: string
}) {
  const { type, to, customerName, serviceType, unitName, brand, date, time, notes, reason } = data

  let subject = ''
  let title = ''
  let icon = ''
  let color = ''
  let message = ''

  if (type === 'complete') {
    subject = `✅ Your ${serviceType} is Complete!`
    title = 'Service Completed!'
    icon = '✅'
    color = brandColors.success
    message = `Great news! Your <strong>${serviceType}</strong> has been completed successfully. Our technician has finished the work.`
  } else if (type === 'delayed') {
    subject = `📅 Your ${serviceType} Has Been Rescheduled`
    title = 'Service Rescheduled'
    icon = '📅'
    color = brandColors.warning
    message = `Your <strong>${serviceType}</strong> has been rescheduled. Please check the new schedule below.`
  } else if (type === 'cancelled') {
    subject = `❌ Your ${serviceType} Has Been Cancelled`
    title = 'Service Cancelled'
    icon = '❌'
    color = brandColors.error
    message = `Your <strong>${serviceType}</strong> has been cancelled. We apologize for any inconvenience.`
  }

  const html = baseTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Hi ${customerName}! ${icon}</h2>
    
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">${message}</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px;">Service</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${serviceType}</td>
            </tr>
            ${date ? `<tr><td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Date</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${date}</td></tr>` : ''}
            ${time ? `<tr><td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Time</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${time}</td></tr>` : ''}
            ${reason ? `<tr><td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Reason</td><td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${reason}</td></tr>` : ''}
            ${notes ? `<tr><td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Notes</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${notes}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${type === 'complete' ? `
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Thank you for choosing <strong>Azalea Aircon Services</strong>! If you have any questions or need follow-up services, please don't hesitate to contact us.
    </p>
    ` : type === 'delayed' ? `
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Our team will arrive at the rescheduled time. Please ensure someone is available at the service location.
    </p>
    ` : `
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      We apologize for any inconvenience. If you'd like to reschedule or have any questions, please contact us.
    </p>
    `}
  `)

try {
    const { data: result, error } = await resend.emails.send({
      from: 'Aircon One <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    })
    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

export async function sendBookingConfirmationEmail(data: {
  to: string
  customerName: string
  serviceType: string
  preferredDate: string
  preferredTime: string
}) {
  const { to, customerName, serviceType, preferredDate, preferredTime } = data

  const html = baseTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">🎉 Booking Confirmed!</h2>
    
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>, your <strong>${serviceType}</strong> has been scheduled!
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.success}; font-weight: 600; font-size: 14px;">📅 Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600;">${preferredDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.success}; font-weight: 600; font-size: 14px; border-top: 1px solid #a7f3d0;">⏰ Time</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #a7f3d0; font-weight: 600;">${preferredTime}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Our technician will arrive during your scheduled time slot. Please ensure someone is available at the service location.
    </p>
    
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px;">
      Need to reschedule? Contact us at least 24 hours before your appointment.
    </p>
  `)

try {
    const { data: result, error } = await resend.emails.send({
      from: 'Aircon One <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    })
    console.log('Booking confirmation email result:', { result, error })
    if (error) {
      console.error('Resend booking error:', error)
      return { success: false, error }
    }
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Booking email exception:', error)
    return { success: false, error }
  }
}

export async function sendClientMessageEmail(data: {
  to: string
  clientName: string
  clientEmail: string
  subject: string
  message: string
}) {
  const { to, clientName, clientEmail, subject, message } = data

  const html = baseTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">💬 New Message from Client</h2>
    
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      A client has sent you a message:
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px;">From</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Subject</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Message</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Please log in to your admin dashboard to respond to this message.
    </p>
  `)

  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Azalea Aircon Services <onboarding@resend.dev>',
      to: to,
      subject: `💬 New Message from ${clientName}: ${subject}`,
      html: html,
    })
    if (error) return { success: false, error }
    return { success: true, id: result?.id }
  } catch (error) {
    return { success: false, error }
  }
}

export async function sendClientReminderEmail(data: {
  to: string
  customerName: string
  title: string
  message: string
}) {
  const { to, customerName, title, message } = data

  const html = baseTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">📢 ${title}</h2>
    
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>,
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d; margin: 20px 0;">
      <tr>
        <td style="padding: 20px; color: #92400e; font-size: 15px; line-height: 1.6;">
          ${message}
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Log in to your dashboard to view details and take action.
    </p>
  `)

  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Azalea Aircon Services <onboarding@resend.dev>',
      to: to,
      subject: title,
      html: html,
    })
    if (error) return { success: false, error }
    return { success: true, id: result?.id }
  } catch (error) {
    return { success: false, error }
  }
}