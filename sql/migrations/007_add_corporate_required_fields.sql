-- Migration: Add more corporate booking fields and inspection flag
-- Using separate statements to handle if columns already exist

ALTER TABLE leads ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS number_of_units INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS inspection_required BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN leads.designation IS 'Contact person designation/position';
COMMENT ON COLUMN leads.number_of_units IS 'Estimated number of units for planning';
COMMENT ON COLUMN leads.special_instructions IS 'Access, parking, or other requirements';
COMMENT ON COLUMN leads.inspection_required IS 'Auto-flag for corporate leads';