import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createAdminClient()

  try {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    const { data: settings } = await supabase
      .from('settings')
      .select('maintenance_reminder_enabled, maintenance_reminder_months')
      .eq('id', 'main')
      .single()

    if (!settings?.maintenance_reminder_enabled) {
      return NextResponse.json({ message: 'Maintenance reminders disabled', notified: 0 })
    }

    const reminderMonths = settings?.maintenance_reminder_months || 3
    const checkDate = new Date()
    checkDate.setMonth(checkDate.getMonth() + reminderMonths)
    const checkDateStr = checkDate.toISOString().split('T')[0]

    const { data: dueItems, error: queryError } = await supabase
      .from('maintenance_items')
      .select('*, client_units(unit_name, brand, technology, horsepower, profiles(id, full_name, email))')
      .lte('next_cleaning_date', checkDateStr)
      .gte('next_cleaning_date', today)
      .eq('status', 'Done')

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json({ error: queryError.message }, { status: 500 })
    }

    let notifiedCount = 0

    for (const item of dueItems || []) {
      const clientId = item.client_units?.client_id
      const unitName = item.client_units?.unit_name
      const brand = item.client_units?.brand
      const hp = item.client_units?.horsepower

      if (!clientId) continue

      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', clientId)
        .eq('title', `Maintenance Due: ${unitName}`)
        .gte('created_at', today.split('T')[0])
        .single()

      if (existingNotification) continue

      await supabase
        .from('notifications')
        .insert({
          user_id: clientId,
          title: 'Aircon Maintenance Due',
          message: `Your ${brand} ${unitName} (${hp}HP ${item.client_units?.technology}) is due for maintenance. Please schedule a maintenance appointment.`,
          type: 'reminder',
          link: '/dashboard'
        })

      notifiedCount++
    }

    return NextResponse.json({ 
      success: true, 
      checked: dueItems?.length || 0,
      notified: notifiedCount 
    })

  } catch (error) {
    console.error('Maintenance notify error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}