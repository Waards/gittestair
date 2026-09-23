-- Migration 024: Relax remaining NOT NULL constraints on leads to match app behavior
-- (v2 — fixes 22007 error: the previous version added CHECK (preferred_date <> ''),
--  but preferred_date is a DATE column, and '' cannot be cast to date.)
--
-- Context: the "Book a Service" form is an INQUIRY flow — clients may submit
-- without a preferred date/time, and no service type is collected. Until these
-- constraints are relaxed, lead inserts fail with:
--   23502: null value in column "preferred_date" of relation "leads" violates not-null constraint
--
-- Safe to re-run: every statement is idempotent.
--
-- Run in Supabase SQL Editor (or psql), then confirm a booking from the landing page.

-- 1) Backfill legacy rows
UPDATE leads SET service_type = 'For Assessment' WHERE service_type IS NULL OR service_type = '';

-- 2) Drop NOT NULL on the three app-optional columns
--    (no-op success if already nullable)
ALTER TABLE leads ALTER COLUMN service_type   DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN preferred_date DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN preferred_time DROP NOT NULL;

-- 3) Guardrail for the TEXT column only.
--    NOTE: no empty-string checks on preferred_date (DATE) or preferred_time —
--    the app's Zod schema (dateSchema / timeSlotSchema) validates formats,
--    and '' is not a valid literal for date/time types at the DB level.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_service_type_not_empty;
ALTER TABLE leads
  ADD CONSTRAINT leads_service_type_not_empty CHECK (service_type IS NULL OR service_type <> '');

COMMENT ON COLUMN leads.service_type   IS 'Optional; NULL/empty means "For Assessment" until admin confirms the actual service';
COMMENT ON COLUMN leads.preferred_date IS 'Optional; NULL means client did not choose a schedule (inquiry flow)';
COMMENT ON COLUMN leads.preferred_time IS 'Optional; NULL means client did not choose a schedule (inquiry flow)';
