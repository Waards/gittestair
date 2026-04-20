-- Migration: Add warranty tracking fields to repair_jobs table

ALTER TABLE repair_jobs 
ADD COLUMN IF NOT EXISTS affected_unit_type TEXT,
ADD COLUMN IF NOT EXISTS warranty_claim BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS warranty_ref_number TEXT,
ADD COLUMN IF NOT EXISTS covered_by TEXT;

COMMENT ON COLUMN repair_jobs.affected_unit_type IS 'Which unit is affected: Indoor, Outdoor, or Both';
COMMENT ON COLUMN repair_jobs.warranty_claim IS 'Whether this repair is covered under warranty';
COMMENT ON COLUMN repair_jobs.warranty_ref_number IS 'Warranty claim reference number';
COMMENT ON COLUMN repair_jobs.covered_by IS 'Warranty provider: Manufacturer, Store, or Extended';