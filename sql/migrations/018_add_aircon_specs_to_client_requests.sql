-- Migration: Carry customer aircon details from booking form onto the service job
-- Columns mirror the specs captured on the landing page form (brand, unit type, horsepower)
-- so approved jobs show what the customer booked. Safe to run even if earlier
-- migrations (013/016) were already applied (IF NOT EXISTS).

-- Bookings from the client dashboard / converted leads land here first
ALTER TABLE client_requests
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT;

-- Installation jobs (re-assert; originally added by migration 013)
ALTER TABLE installations
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT;

-- Repair jobs (re-assert; originally added by migration 016)
ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT;

-- Maintenance jobs (re-assert; originally added by migration 016)
ALTER TABLE maintenance
ADD COLUMN IF NOT EXISTS aircon_brand TEXT,
ADD COLUMN IF NOT EXISTS aircon_type TEXT,
ADD COLUMN IF NOT EXISTS horsepower TEXT;
