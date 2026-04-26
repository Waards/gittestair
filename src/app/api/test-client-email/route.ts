import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { sendClientMessageEmail } = await import('@/lib/email-service')
    
    const result = await sendClientMessageEmail({
      to: 'sjosafatvillegas@gmail.com',
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message from the client.'
    })
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Test email sent successfully' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}