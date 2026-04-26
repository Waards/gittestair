import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { 
      type, 
      email, 
      customerName, 
      serviceType, 
      unitName, 
      brand, 
      date, 
      time,
      notes,
      reason 
    } = await req.json()

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { sendServiceEmail, sendBookingConfirmationEmail } = await import('@/lib/email-service')

    if (type === 'complete') {
      const result = await sendServiceEmail({
        type: 'complete',
        to: email,
        customerName: customerName || email.split('@')[0],
        serviceType: serviceType || 'Service',
        unitName,
        brand,
        date,
        time,
        notes
      })
      return NextResponse.json(result)
    }

    if (type === 'delayed') {
      const result = await sendServiceEmail({
        type: 'delayed',
        to: email,
        customerName: customerName || email.split('@')[0],
        serviceType: serviceType || 'Service',
        unitName,
        brand,
        date,
        time,
        reason
      })
      return NextResponse.json(result)
    }

    if (type === 'cancelled') {
      const result = await sendServiceEmail({
        type: 'cancelled',
        to: email,
        customerName: customerName || email.split('@')[0],
        serviceType: serviceType || 'Service',
        unitName,
        brand,
        date,
        time,
        reason
      })
      return NextResponse.json(result)
    }

    if (type === 'booking_confirmation') {
      const result = await sendBookingConfirmationEmail({
        to: email,
        customerName: customerName || email.split('@')[0],
        serviceType: serviceType || 'Service',
        preferredDate: date || '',
        preferredTime: time || ''
      })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}