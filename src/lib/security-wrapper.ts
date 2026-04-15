import { validateCsrfToken, checkRequestOrigin, CSRF_ERROR } from './csrf'
import { checkRateLimit, RATE_LIMIT_ERROR } from './rate-limit'

export interface SecurityConfig {
  enableCsrf?: boolean
  enableRateLimit?: boolean
  rateLimitKey?: string
  skipAuth?: boolean
}

export async function withSecurity<T>(
  config: SecurityConfig,
  handler: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    if (config.enableCsrf !== false) {
      const csrfValid = await validateCsrfToken()
      if (!csrfValid) {
        console.warn('CSRF validation failed')
        return { success: false, error: CSRF_ERROR }
      }
    }

    if (config.enableRateLimit !== false) {
      const key = config.rateLimitKey || 'default'
      const { allowed, resetTime } = checkRateLimit(key)
      
      if (!allowed) {
        console.warn(`Rate limit exceeded for: ${key}`)
        return { 
          success: false, 
          error: RATE_LIMIT_ERROR 
        }
      }
    }

    const data = await handler()
    return { success: true, data }
  } catch (error) {
    console.error('Security wrapper error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function secureAction<T>(
  handler: () => Promise<T>,
  options?: {
    rateLimitKey?: string
    skipCsrf?: boolean
  }
): Promise<{ success: boolean; data?: T; error?: string }> {
  return withSecurity(
    {
      enableCsrf: !options?.skipCsrf,
      enableRateLimit: true,
      rateLimitKey: options?.rateLimitKey,
    },
    handler
  )
}