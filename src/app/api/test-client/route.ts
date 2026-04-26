import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient()

    const testEmail = 'test-client-' + Date.now() + '@test.com'
    const testData = {
      full_name: 'Test Client User',
      email: testEmail,
      phone_number: '09123456789',
      service_address: '123 Test Street, Manila',
      client_type: 'Residential',
      service_type: 'Maintenance',
      preferred_date: '2026-05-01',
      preferred_time: '10:00 AM - 12:00 PM',
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: true,
      user_metadata: { full_name: testData.full_name, role: 'client' }
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message })
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: testData.full_name,
        email: testEmail,
        phone: testData.phone_number,
        address: testData.service_address,
        client_type: testData.client_type,
        role: 'client',
        password: 'testpass123'
      })

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message })
    }

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: authData.user.id,
        title: 'Welcome!',
        message: `Your account has been created. Login at your-site.com/login with your email and password.`,
        type: 'reminder',
        link: '/dashboard'
      })

    if (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: 'Test client created successfully',
      testClient: {
        email: testEmail,
        password: 'testpass123',
        userId: authData.user.id
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}