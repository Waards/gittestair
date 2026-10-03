-- 025: Security question for password recovery (set in Admin → Settings → Security).
-- The answer is stored as a SHA-256 hash, never in plain text.

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS security_question text,
  ADD COLUMN IF NOT EXISTS security_answer_hash text;
