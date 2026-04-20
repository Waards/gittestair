-- Migration: Add corporate booking fields to leads table

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS building_name TEXT,
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS province TEXT;

COMMENT ON COLUMN leads.company_name IS 'Company name for corporate clients';
COMMENT ON COLUMN leads.contact_person IS 'Contact person for corporate bookings';
COMMENT ON COLUMN leads.building_name IS 'Building name or complex';
COMMENT ON COLUMN leads.floor IS 'Floor number or level';
COMMENT ON COLUMN leads.province IS 'Province for address';