-- Migration: Track who registered a client unit
-- 'admin'  = registered by an admin (default, also backfills existing rows)
-- 'client' = self-registered by the client from their dashboard

ALTER TABLE client_units
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin';

COMMENT ON COLUMN client_units.source IS 'Who registered the unit: admin or client (self-registered)';
