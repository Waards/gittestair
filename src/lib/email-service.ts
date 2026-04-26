import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const baseStyles = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8fafc;
`

const headerStyles = `
  background: linear-gradient(135deg, #005596 0%, #0062a3 100%);
  padding: 30px;
  text-align: center;
`

const contentStyles = `
  padding: 30px;
`

const footerStyles = `
  background: #f1f5f9;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
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
  let detailsBg = '#f1f5f9'
  let detailsBorder = '#e2e8f0'

  if (type === 'complete') {
    subject = `Your ${serviceType} Service is Complete!`
    title = 'Service Completed!'
    icon = '✅'
    color = '#059669'
    message = `Great news! Your <strong>${serviceType}</strong> service has been completed successfully.`
  } else if (type === 'delayed') {
    subject = `Your ${serviceType} Service Has Been Rescheduled`
    title = 'Service Rescheduled'
    icon = '⏰'
    color = '#d97706'
    detailsBg = '#fef3c7'
    detailsBorder = '#fcd34d'
    message = `Your <strong>${serviceType}</strong> service has been rescheduled.`
  } else if (type === 'cancelled') {
    subject = `Your ${serviceType} Service Has Been Cancelled`
    title = 'Service Cancelled'
    icon = '❌'
    color = '#dc2626'
    detailsBg = '#fee2e2'
    detailsBorder = '#fca5a5'
    message = `Your <strong>${serviceType}</strong> service has been cancelled.`
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="${headerStyles}">
            <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
          </div>
          
          <div style="${contentStyles}">
            <p style="font-size: 18px; color: #1e293b;">Hi ${customerName},</p>
            
            <p style="color: #64748b; line-height: 1.6;">
              ${message}
            </p>
            
            <div style="background: ${detailsBg}; border: 1px solid ${detailsBorder}; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: ${color}; font-size: 16px; font-weight: bold;">${icon} ${serviceType}</p>
              ${unitName ? `<p style="margin: 0 0 10px 0;"><strong style="color: #005596;">Unit:</strong> ${brand ? brand + ' ' : ''}${unitName}</p>` : ''}
              ${date ? `<p style="margin: 0 0 10px 0;"><strong style="color: #005596;">Date:</strong> ${date}</p>` : ''}
              ${time ? `<p style="margin: 0 0 10px 0;"><strong style="color: #005596;">Time:</strong> ${time}</p>` : ''}
              ${reason ? `<p style="margin: 0; color: #92400e;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            
            ${notes && type === 'complete' ? `
              <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;"><strong>Service Notes:</strong> ${notes}</p>
              </div>
            ` : ''}
            
            ${type === 'cancelled' ? `
              <p style="color: #64748b; line-height: 1.6;">
                We apologize for any inconvenience. If you would like to reschedule or have any questions, please contact us.
              </p>
            ` : ''}
            
            ${type === 'delayed' ? `
              <p style="color: #64748b; line-height: 1.6;">
                Our team will arrive at the rescheduled time. Please ensure someone is available at the location.
              </p>
            ` : ''}
            
            ${type === 'complete' ? `
              <p style="color: #64748b; line-height: 1.6;">
                If you have any questions or need follow-up services, feel free to contact us.
              </p>
            ` : ''}
            
            <p style="color: #64748b; margin-top: 30px;">
              Thank you for choosing our service!<br>
              <strong>Aircon One</strong>
            </p>
          </div>
          
          <div style="${footerStyles}">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              This is an automated message from Aircon One. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Aircon One <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
      text: `${title}\n\nHi ${customerName},\n\n${message.replace(/<[^>]*>/g, '')}\n\nService: ${serviceType}\n${unitName ? 'Unit: ' + (brand ? brand + ' ' : '') + unitName : ''}\n${date ? 'Date: ' + date : ''}\n${time ? 'Time: ' + time : ''}\n${reason ? 'Reason: ' + reason : ''}\n${notes ? 'Notes: ' + notes : ''}\n\nThank you!\nAircon One`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Email send error:', error)
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

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="${headerStyles}">
            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          </div>
          
          <div style="${contentStyles}">
            <p style="font-size: 18px; color: #1e293b;">Hi ${customerName},</p>
            
            <p style="color: #64748b; line-height: 1.6;">
              Your <strong>${serviceType}</strong> has been scheduled.
            </p>
            
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong style="color: #005596;">Date:</strong> ${preferredDate}</p>
              <p style="margin: 0;"><strong style="color: #005596;">Time:</strong> ${preferredTime}</p>
            </div>
            
            <p style="color: #64748b; line-height: 1.6;">
              Our technician will arrive during your scheduled time slot. Please ensure someone is available at the location.
            </p>
            
            <p style="color: #64748b; margin-top: 30px;">
              Thank you!<br>
              <strong>Aircon One</strong>
            </p>
          </div>
          
          <div style="${footerStyles}">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              This is an automated message from Aircon One.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Aircon One <onboarding@resend.dev>',
      to: to,
      subject: `Booking Confirmed: ${serviceType} on ${preferredDate}`,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, id: result?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}