export interface Lead {
  id: string
  full_name: string
  phone_number: string
  email: string
  service_address: string
  client_type: 'Residential' | 'Corporate'
  service_type: string
  preferred_date: string
  preferred_time: string
  additional_info: string | null
  status: 'Pending' | 'Contacted' | 'Converted' | 'Accepted' | 'Rejected'
  created_at: string
  unit_brand_type: string | null
  street: string | null
  barangay: string | null
  city: string | null
  zip_code: string | null
  aircon_brand: string | null
  aircon_type: string | null
  horsepower: string | null
  btu: string | null
  company_name: string | null
  contact_person: string | null
  building_name: string | null
  floor: string | null
  province: string | null
}

export interface ClientRequest {
  id: string
  created_at: string
  client_id: string | null
  client_name: string
  request_type: string
  message: string | null
  status: 'Pending' | 'Approved' | 'Rejected'
  preferred_date: string | null
  preferred_time: string | null
}

export interface PendingRequest {
  id: string
  created_at: string
  source: 'lead' | 'request'
  displayDate: string
  displayTime: string
  full_name?: string
  client_name?: string
  phone_number?: string
  phone?: string
  email?: string
  service_address?: string
  address?: string
  client_type?: string
  service_type?: string
  request_type?: string
  preferred_date?: string
  preferred_time?: string
  additional_info?: string | null
  message?: string | null
  status: 'Pending' | 'Contacted' | 'Converted' | 'Accepted' | 'Rejected' | 'Approved'
}

export interface Appointment {
  id: string
  client_name: string
  email: string
  phone: string
  address: string
  service_type: string
  date: string
  time: string
  status: 'pending' | 'Scheduled' | 'Completed' | 'Cancelled'
  created_at: string
  notes?: string | null
  priority?: string
  is_corporate?: boolean
}

export interface Installation {
  id: string
  title: string
  client_name: string
  location: string
  technician: string | null
  date: string
  status: 'In Progress' | 'Scheduled' | 'Completed'
  progress: number
  created_at: string
  cost: string | null
  notes: string | null
  time: string | null
  type: 'Real-Time' | 'Scheduled'
}

export interface Repair {
  id: string
  title: string
  client_name: string
  location: string
  technician: string | null
  date: string
  status: 'In Progress' | 'Scheduled' | 'Completed'
  progress: number
  created_at: string
  cost: string | null
  notes: string | null
  time: string | null
  type: 'Real-Time' | 'Scheduled'
}

export interface Maintenance {
  id: string
  title: string
  client_name: string
  location: string | null
  technician: string | null
  date: string | null
  time: string | null
  cost: string | null
  notes: string | null
  type: 'Standard' | 'Real-Time' | 'Scheduled'
  status: 'Scheduled' | 'In Progress' | 'Completed'
  progress: number
  created_at: string
  updated_at: string
  is_multi_unit: boolean
  client_id: string | null
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'client'
  created_at: string
  client_type: 'Residential' | 'Corporate'
  is_archived: boolean
  phone: string | null
  address: string | null
  street: string | null
  barangay: string | null
  city: string | null
  zip_code: string | null
}

export interface ClientUnit {
  id: string
  client_id: string | null
  unit_name: string
  brand: string
  unit_type: string
  technology: string
  horsepower: number
  indoor_serial: string | null
  outdoor_serial: string | null
  installation_date: string | null
  created_at: string
  is_multi_unit: boolean
  warranty_months: number | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  warranty_provider: string | null
  warranty_type: string | null
}

export interface UnitComponent {
  id: string
  client_unit_id: string | null
  component_type: 'Indoor' | 'Outdoor' | 'Condenser' | 'Air Handler'
  serial_number: string | null
  position_index: number
  created_at: string
}

export interface WarrantyStatus {
  isActive: boolean
  daysRemaining: number
  provider: string | null
  endDate: string | null
  type: string | null
}

export interface RepairJob extends Record<string, unknown> {
  id: string
  unit_id: string | null
  client_id: string | null
  error_code: string | null
  symptom: string | null
  parts_replaced: Array<{ name: string; qty: number; price: number }>
  before_photo_url: string | null
  after_photo_url: string | null
  status: 'Open' | 'In Progress' | 'Completed'
  created_at: string
  affected_unit_type?: 'Indoor' | 'Outdoor' | 'Both' | null
  warranty_claim?: boolean
  warranty_ref_number?: string | null
  covered_by?: string | null
}

export interface Technician {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  specialization: string
  status: 'Active' | 'Inactive'
  hire_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  created_at: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  user_id: string | null
}

export interface Settings {
  id: string
  company_name: string | null
  company_email: string | null
  company_phone: string | null
  timezone: string | null
  company_address: string | null
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  new_booking_alert: boolean
  booking_update_alert: boolean
  payment_alert: boolean
  reminder_enabled: boolean
  reminder_hours_before: number
  follow_up_enabled: boolean
  follow_up_days_after: number
  maintenance_reminder_enabled: boolean
  maintenance_reminder_months: number
  two_factor_enabled: boolean
  session_timeout_minutes: number
  require_password_change_days: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}