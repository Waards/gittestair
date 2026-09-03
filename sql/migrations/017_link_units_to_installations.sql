-- Migration: Link registered units to installation jobs
-- Relationship: Client -> Installation Job -> Registered Unit -> Asset Details

ALTER TABLE client_units 
ADD COLUMN IF NOT EXISTS installation_id UUID REFERENCES installations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS installation_technician TEXT,
ADD COLUMN IF NOT EXISTS installation_location TEXT;

CREATE INDEX IF NOT EXISTS idx_client_units_installation_id ON client_units(installation_id);

COMMENT ON COLUMN client_units.installation_id IS 'Linked installation job this unit was installed by';
COMMENT ON COLUMN client_units.model IS 'Unit model number';
COMMENT ON COLUMN client_units.installation_technician IS 'Technician snapshot from the linked installation job';
COMMENT ON COLUMN client_units.installation_location IS 'Location snapshot from the linked installation job';