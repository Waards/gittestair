import { z } from 'zod'

const MAX_STRING_LENGTH = 10000
const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 255
const MAX_PHONE_LENGTH = 11

export const sanitizedString = (value: string): string => {
  if (typeof value !== 'string') return ''
  return value
    .slice(0, MAX_STRING_LENGTH)
    .replace(/[<>]/g, '')
    .trim()
}

export const sanitizedEmail = (value: string): string => {
  if (typeof value !== 'string') return ''
  return value
    .slice(0, MAX_EMAIL_LENGTH)
    .toLowerCase()
    .trim()
}

export const sanitizedPhone = (value: string): string => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\D/g, '')
    .slice(0, MAX_PHONE_LENGTH)
}

export const sanitizedName = (value: string): string => {
  if (typeof value !== 'string') return ''
  return value
    .slice(0, MAX_NAME_LENGTH)
    .replace(/[<>]/g, '')
    .trim()
}

export const sanitizedDate = (value: string): string => {
  if (typeof value !== 'string') return ''
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(value)) return ''
  return value
}

export const sanitizedTime = (value: string): string => {
  if (typeof value !== 'string') return ''
  const timeRegex = /^\d{1,2}:\d{2}(?:\s*[AP]M)?$/i
  if (!timeRegex.test(value)) return ''
  return value
}

export const phoneSchema = z
  .string()
  .max(MAX_PHONE_LENGTH)
  .regex(/^09\d{9}$/, 'Must be a valid Philippines number (e.g., 09123456789)')

export const emailSchema = z
  .string()
  .max(MAX_EMAIL_LENGTH)
  .email('Invalid email address')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
  .transform(val => val.replace(/[<>]/g, '').trim())

export const optionalNameSchema = z
  .string()
  .max(MAX_NAME_LENGTH)
  .transform(val => val ? val.replace(/[<>]/g, '').trim() : '')

export const stringSchema = (maxLength: number = MAX_STRING_LENGTH) =>
  z
    .string()
    .max(maxLength, `Must be less than ${maxLength} characters`)
    .transform(val => val.replace(/[<>]/g, '').trim())

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')

export const timeSlotSchema = z
  .string()
  .refine(val => {
    const validSlots = [
      '08:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '01:00 PM - 03:00 PM',
      '03:00 PM - 05:00 PM',
      '05:00 PM - 07:00 PM',
      '07:00 PM - 08:00 PM',
    ]
    return validSlots.includes(val)
  }, 'Invalid time slot')

export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .optional()
  .or(z.literal(''))

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): ValidationResult<T> => {
  try {
    const rawData: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        rawData[key] = value
      }
    })

    const validated = schema.parse(rawData)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return { success: false, error: firstError?.message || 'Validation failed' }
    }
    return { success: false, error: 'Invalid input' }
  }
}

export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): Partial<T> => {
  const sanitized: Partial<T> = {}
  for (const field of fields) {
    const value = obj[field]
    if (typeof value === 'string') {
      (sanitized as Record<string, string>)[field as string] = sanitizedString(value)
    }
  }
  return sanitized
}

export const validateAndSanitizeLead = (data: {
  fullName: string
  phone: string
  email: string
  serviceAddress: string
  clientType: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  additionalInfo?: string
}): ValidationResult<{
  full_name: string
  phone_number: string
  email: string
  service_address: string
  client_type: string
  service_type: string
  preferred_date: string
  preferred_time: string
  additional_info: string | null
  status: string
}> => {
  try {
    const schema = z.object({
      fullName: nameSchema,
      phone: phoneSchema,
      email: emailSchema,
      serviceAddress: stringSchema(500),
      clientType: z.enum(['Residential', 'Corporate']),
      serviceType: stringSchema(100),
      preferredDate: dateSchema,
      preferredTime: timeSlotSchema,
      additionalInfo: stringSchema(2000).optional().default(''),
    })

    const validated = schema.parse(data)

    return {
      success: true,
      data: {
        full_name: validated.fullName,
        phone_number: validated.phone,
        email: validated.email,
        service_address: validated.serviceAddress,
        client_type: validated.clientType,
        service_type: validated.serviceType,
        preferred_date: validated.preferredDate,
        preferred_time: validated.preferredTime,
        additional_info: validated.additionalInfo || null,
        status: 'Pending',
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Invalid input' }
  }
}