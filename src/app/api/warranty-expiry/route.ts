import { checkExpiringWarranties } from '@/app/actions/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const result = await checkExpiringWarranties()
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      expiringNotified: result.notified,
      expiredTagged: result.tagged
    })
  } catch (error) {
    console.error('Warranty expiry API error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}