-- Migration: Make leads.service_type nullable
-- Why: The "Book a Service" form no longer collects a service type, and the app
--      already treats it as optional (Lead type is `string | null`, admin UI falls
--      back to 'For Assessment'). Until this runs, lead inserts fail with:
--      'null value in column "service_type" of relation "leads" violates not-null constraint'
--
-- Run in Supabase SQL Editor (or psql).

-- Backfill: give existing empty-value leads a sensible default so nothing downstream breaks
UPDATE leads
SET service_type = 'For Assessment'
WHERE service_type IS NULL OR service_type = '';

-- Relax the constraint to match application expectations
ALTER TABLE leads
  ALTER COLUMN service_type DROP NOT NULL;

-- Optional guardrail: require at least a non-empty string when a value is provided
ALTER TABLE leads
  ADD CONSTRAINT leads_service_type_not_empty CHECK (service_type IS NULL OR service_type <> '');

COMMENT ON COLUMN leads.service_type IS 'Optional service type; NULL means "For Assessment" until admin confirms the actual service';
