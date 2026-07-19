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

-- Ensure all columns exist (safe to run even if already exists)
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS service_address TEXT;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS preferred_date TEXT;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS preferred_time TEXT;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE client_requests ALTER COLUMN status SET DEFAULT 'Pending';

-- Enable Row Level Security
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (server actions)
CREATE POLICY "Service role has full access" ON client_requests
  FOR ALL USING (true) WITH CHECK (true);
