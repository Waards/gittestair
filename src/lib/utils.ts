import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validatePHPhone(phone: string): boolean {
  const phRegex = /^09\d{9}$/;
  return phRegex.test(phone);
}

export const PHONE_VALIDATION_ERROR = "Phone number must be a valid Philippines number (e.g., 09123456789) and maximum 11 digits.";
