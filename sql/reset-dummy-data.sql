-- ============================================================
-- Reset all dummy data, keep only admin account
-- Admin: admin@gmail.com
-- ============================================================

BEGIN;

-- Child tables first (deepest dependencies)
DELETE FROM unit_components;
DELETE FROM maintenance_items;
DELETE FROM repair_jobs;

-- Service request data
DELETE FROM client_requests;

-- Push notification tokens
DELETE FROM user_fcm_tokens;

-- In-app notifications (references user_id)
DELETE FROM notifications;

-- Core service tables
DELETE FROM appointments;
DELETE FROM installations;
DELETE FROM repairs;
DELETE FROM maintenance;
DELETE FROM leads;

-- Client/technician data
DELETE FROM client_units;
DELETE FROM technicians;

-- Keep settings (global config unaffected)

-- Auth — delete everything except admin
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email != 'admin@gmail.com'
);

DELETE FROM auth.users
WHERE email != 'admin@gmail.com';

COMMIT;
