import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validatePHPhone(phone: string): boolean {
  const phRegex = /^09\d{9}$/;
  return phRegex.test(phone);
}

export function checkWarrantyStatus(unit: {
  warranty_end_date?: string | null
  warranty_months?: number | null
  installation_date?: string | null
}): { isActive: boolean; daysRemaining: number; endDate: string | null; isFree: boolean } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  let endDate: string | null = null
  let daysRemaining = 0
  let isActive = false

  if (unit.warranty_end_date) {
    endDate = unit.warranty_end_date
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    isActive = daysRemaining > 0
  } else if (unit.installation_date && unit.warranty_months) {
    const installDate = new Date(unit.installation_date)
    const end = new Date(installDate)
    end.setMonth(end.getMonth() + (unit.warranty_months || 12))
    endDate = end.toISOString().split('T')[0]
    const diffTime = end.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    isActive = daysRemaining > 0
  }

  return {
    isActive,
    daysRemaining: Math.max(0, daysRemaining),
    endDate,
    isFree: isActive
  }
}

export const PHONE_VALIDATION_ERROR = "Phone number must be a valid Philippines number (e.g., 09123456789) and maximum 11 digits.";
