-- Migration: Add warranty tracking to client_units

ALTER TABLE client_units 
ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS warranty_start_date DATE,
ADD COLUMN IF NOT EXISTS warranty_end_date DATE,
ADD COLUMN IF NOT EXISTS warranty_provider TEXT,
ADD COLUMN IF NOT EXISTS warranty_type TEXT DEFAULT 'Manufacturer';

COMMENT ON COLUMN client_units.warranty_months IS 'Warranty duration in months';
COMMENT ON COLUMN client_units.warranty_start_date IS 'Warranty start date';
COMMENT ON COLUMN client_units.warranty_end_date IS 'Warranty end date';
COMMENT ON COLUMN client_units.warranty_provider IS 'Warranty provider: Manufacturer, Store, Extended';
COMMENT ON COLUMN client_units.warranty_type IS 'Type: Manufacturer, Store, Extended';