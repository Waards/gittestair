-- Migration: Add reschedule_count to all service tables
ALTER TABLE installations ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
