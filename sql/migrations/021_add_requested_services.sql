-- Migration: Support multi-service combined client requests
-- A client can request several services (e.g. Cleaning + Installation + Repair)
-- in one request. The list of requested services (with any per-service notes,
-- such as the repair issue description) is stored as a JSON array:
--   [{ "service": "Cleaning", "notes": null }, { "service": "Repair", "notes": "Not cooling" }]
-- Single-service requests keep using request_type and leave this column NULL.

ALTER TABLE client_requests
ADD COLUMN IF NOT EXISTS requested_services JSONB DEFAULT NULL;
