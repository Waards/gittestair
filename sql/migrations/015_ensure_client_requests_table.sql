-- Migration: Ensure client_requests table exists with all required columns
CREATE TABLE IF NOT EXISTS client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id),
  client_name TEXT,
  request_type TEXT,
  message TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  service_address TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure status column exists (safe to run even if already exists)
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE client_requests ALTER COLUMN status SET DEFAULT 'Pending';
