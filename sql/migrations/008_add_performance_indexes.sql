-- Migration: Add performance indexes

-- Index for profiles role filter (speeds up getClients)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Index for client_units client_id
CREATE INDEX IF NOT EXISTS idx_client_units_client_id ON client_units(client_id);

-- Index for leads client_type filter
CREATE INDEX IF NOT EXISTS idx_leads_client_type ON leads(client_type);

-- Index for leads status filter
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Index for appointments date
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Index for maintenance date  
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance(date);