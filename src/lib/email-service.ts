import emailjs from '@emailjs/nodejs'

const emailjsServiceId = process.env.EMAILJS_SERVICE_ID || ''
const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID || ''
const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY || ''
const emailjsPrivateKey = process.env.EMAILJS_PRIVATE_KEY || ''

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://azelea.vercel.app'

function dashboardLink() {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <tr>
        <td style="text-align: center;">
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px;">To manage your appointment, log in to your dashboard.</p>
          <a href="${siteUrl}/login" style="display: inline-block; background-color: #005596; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Login to Dashboard</a>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px;">${siteUrl}/login</p>
        </td>
      </tr>
    </table>
  `
}

async function sendEmail(to: string, subject: string, innerContent: string) {
  try {
    const result = await emailjs.send(
      emailjsServiceId,
      emailjsTemplateId,
      {
        to_email: to,
        subject: subject,
        html_content: innerContent,
      },
      {
        publicKey: emailjsPublicKey,
        privateKey: emailjsPrivateKey,
      }
    )
    console.log('Email sent:', result.status, result.text)
    return { success: true }
  } catch (error: any) {
    console.error('Email send exception:', error)
    return { success: false, error: error?.message || String(error) }
  }
}

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
  let content = ''

  if (type === 'complete') {
    subject = `✅ Your ${serviceType} is Complete!`
    content = `
      <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Hi ${customerName}! ✅</h2>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
        Great news! Your <strong>${serviceType}</strong> has been completed successfully. Our technician has finished the work.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px;">Service</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${serviceType}</td>
              </tr>
              ${date ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Date</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${date}</td></tr>` : ''}
              ${time ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Time</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${time}</td></tr>` : ''}
              ${notes ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Notes</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${notes}</td></tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
      <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
        Thank you for choosing <strong>Azalea Aircon Services</strong>! If you have any questions or need follow-up services, please don't hesitate to contact us.
      </p>
    `
  } else if (type === 'delayed') {
    subject = `📅 Your ${serviceType} Has Been Rescheduled`
    content = `
      <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Hi ${customerName}! 📅</h2>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
        Your <strong>${serviceType}</strong> has been rescheduled. Please check the new schedule below.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px;">Service</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${serviceType}</td>
              </tr>
              ${date ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Date</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${date}</td></tr>` : ''}
              ${time ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Time</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${time}</td></tr>` : ''}
              ${reason ? `<tr><td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Reason</td><td style="padding: 8px 0; color: #92400e; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${reason}</td></tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
      <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
        Our team will arrive at the rescheduled time. Please ensure someone is available at the service location.
      </p>
    `
  } else if (type === 'cancelled') {
    subject = `❌ Your ${serviceType} Has Been Cancelled`
    content = `
      <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Hi ${customerName}! ❌</h2>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
        Your <strong>${serviceType}</strong> has been cancelled. We apologize for any inconvenience.
      </p>
      ${reason ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
        <tr>
          <td style="padding: 20px; color: #991b1b; font-size: 14px;">
            <strong>Reason:</strong> ${reason}
          </td>
        </tr>
      </table>
      ` : ''}
      <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
        If you'd like to reschedule or have any questions, please contact us.
      </p>
    `
  }

  return sendEmail(to, subject, content + dashboardLink())
}

export async function sendBookingConfirmationEmail(data: {
  to: string
  customerName: string
  serviceType: string
  preferredDate: string
  preferredTime: string
}) {
  const { to, customerName, serviceType, preferredDate, preferredTime } = data

  const subject = `Booking Confirmed - ${serviceType}`

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Booking Confirmed!</h2>
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>, your <strong>${serviceType}</strong> has been scheduled!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #059669; font-weight: 600; font-size: 14px;">Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600;">${preferredDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #059669; font-weight: 600; font-size: 14px; border-top: 1px solid #a7f3d0;">Time</td>
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
  `

  return sendEmail(to, subject, content + dashboardLink())
}

export async function sendClientMessageEmail(data: {
  to: string
  clientName: string
  clientEmail: string
  subject: string
  message: string
}) {
  const { to, clientName, clientEmail, subject, message } = data

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">New Message from Client</h2>
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      A client has sent you a message:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px;">From</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Subject</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Message</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Please log in to your admin dashboard to respond to this message.
    </p>
  `

  return sendEmail(to, `New Message from ${clientName}: ${subject}`, content)
}

export async function sendClientReminderEmail(data: {
  to: string
  customerName: string
  title: string
  message: string
}) {
  const { to, customerName, title, message } = data

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">${title}</h2>
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
  `

  return sendEmail(to, title, content + dashboardLink())
}

export async function sendWelcomeEmail(data: {
  to: string
  customerName: string
  password: string
}) {
  const { to, customerName, password } = data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Welcome to Azalea Aircon Services!</h2>
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>, your account has been created. Here are your login credentials:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #e2e8f0;">Password</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0; font-family: monospace; font-weight: 700;">${password}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Click below to log in and access your dashboard.
    </p>
    <a href="${siteUrl}/login" style="display: inline-block; background-color: #005596; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px;">Log In Now</a>
  `

  return sendEmail(to, `Welcome to Azalea Aircon Services!`, content)
}

export async function sendWarrantyExpiryEmail(data: {
  to: string
  customerName: string
  unitName: string
  brand: string
  warrantyEndDate: string
  daysLeft: number
}) {
  const { to, customerName, unitName, brand, warrantyEndDate, daysLeft } = data

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Warranty Expiring Soon</h2>
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>, the warranty for your aircon unit is expiring soon.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">Unit</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${brand} ${unitName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; font-size: 14px; border-top: 1px solid #fcd34d;">Expires</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #fcd34d;">${warrantyEndDate} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Please contact us to renew or extend your warranty before it expires. Repairs after warranty expiration may be chargeable.
    </p>
  `

  return sendEmail(to, `Warranty Expiring: ${brand} ${unitName}`, content + dashboardLink())
}

export async function sendMaintenanceReminderEmail(data: {
  to: string
  customerName: string
  unitName: string
  brand: string
  serviceType: string
}) {
  const { to, customerName, unitName, brand, serviceType } = data

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">Maintenance Reminder</h2>
    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
      Hi <strong>${customerName}</strong>, it's time to schedule maintenance for your aircon unit.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px;">Unit</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${brand} ${unitName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #005596; font-weight: 600; font-size: 14px; border-top: 1px solid #bfdbfe;">Service</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; border-top: 1px solid #bfdbfe;">${serviceType}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Regular maintenance helps prevent breakdowns and extends the lifespan of your unit. Please log in to schedule a maintenance appointment.
    </p>
  `

  return sendEmail(to, `Maintenance Reminder: ${brand} ${unitName}`, content + dashboardLink())
}
