-- Migration: Add unit_components table and is_multi_unit field

-- 1. Add is_multi_unit column to client_units table
ALTER TABLE client_units 
ADD COLUMN IF NOT EXISTS is_multi_unit BOOLEAN DEFAULT FALSE;

-- 2. Create unit_components table
CREATE TABLE IF NOT EXISTS unit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_unit_id UUID REFERENCES client_units(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK (component_type IN ('Indoor', 'Outdoor', 'Condenser', 'Air Handler')),
  serial_number TEXT UNIQUE,
  position_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_unit_components_client_unit_id ON unit_components(client_unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_components_serial_number ON unit_components(serial_number);