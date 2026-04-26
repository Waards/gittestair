import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { sendBookingConfirmationEmail } = await import('@/lib/email-service')

    const result = await sendBookingConfirmationEmail({
      to: 'sjosafatvillegas@gmail.com',
      customerName: 'Test User',
      serviceType: 'Aircon Installation',
      preferredDate: new Date().toLocaleDateString(),
      preferredTime: '10:00 AM'
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Test email sent to wardswannabe@gmail.com' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}