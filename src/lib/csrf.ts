import { headers } from 'next/headers'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_SECRET = process.env.CSRF_SECRET || 'dev-secret-change-in-production'

export async function validateCsrfToken(): Promise<boolean> {
  try {
    const headersList = await headers()
    const token = headersList.get(CSRF_TOKEN_HEADER)
    
    if (!token) {
      console.warn('CSRF token missing')
      return false
    }

    return token === CSRF_SECRET
  } catch (error) {
    console.error('CSRF validation error:', error)
    return false
  }
}

export function getCsrfToken(): string {
  return CSRF_SECRET
}

export async function checkRequestOrigin(): Promise<boolean> {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const referer = headersList.get('referer')

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://localhost:3000',
    ]

    if (origin && allowedOrigins.includes(origin)) {
      return true
    }

    if (referer) {
      const allowedReferers = allowedOrigins.map(o => o + '/')
      return allowedReferers.some(r => referer.startsWith(r))
    }

    return true
  } catch {
    return true
  }
}

export const CSRF_ERROR = 'Security validation failed. Please refresh the page and try again.'