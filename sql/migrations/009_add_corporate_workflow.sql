-- Migration: Corporate Lead Workflow & Priority

-- Add priority field to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;

-- Add priority field to installations
ALTER TABLE installations ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE installations ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;

-- Add priority field to maintenance
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;

-- Add priority field to repairs
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;

-- Update existing corporate leads to have inspection required
UPDATE leads 
SET inspection_required = true 
WHERE client_type = 'Corporate' 
AND status NOT IN ('Converted', 'Accepted', 'Rejected');

-- Add comments
COMMENT ON COLUMN appointments.priority IS 'Priority: Normal, High, Urgent';
COMMENT ON COLUMN appointments.is_corporate IS 'True for corporate clients';