-- ============================================================
--  GrandInvite — Super Admin Setup SQL
--  Run this in your Supabase SQL Editor
-- ============================================================

-- 0a. Multi-Admin Support Table
CREATE TABLE IF NOT EXISTS admin_users (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text        NOT NULL UNIQUE,
  added_by   text,
  is_primary boolean     DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_users_deny_all" ON admin_users;
CREATE POLICY "admin_users_deny_all" ON admin_users FOR ALL USING (false);

-- Insert the primary admin (your email)
INSERT INTO admin_users (email, is_primary, added_by)
VALUES ('shaimesika10@gmail.com', true, 'system')
ON CONFLICT (email) DO NOTHING;

-- 0b. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key         text        PRIMARY KEY,
  value       text        NOT NULL DEFAULT '',
  description text,
  updated_by  text,
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_deny_all" ON site_settings;
CREATE POLICY "site_settings_deny_all" ON site_settings FOR ALL USING (false);

-- Default settings
INSERT INTO site_settings (key, value, description) VALUES
  ('max_free_guests',  '200',   'Max guests allowed on the free plan per wedding'),
  ('gallery_enabled',  'true',  'Enable the photo gallery for all weddings'),
  ('ai_chat_enabled',  'true',  'Enable the AI assistant on invitation pages'),
  ('maintenance_mode', 'false', 'Show maintenance page to all non-admin visitors'),
  ('support_email',    'support@grandinvite.com', 'Contact email shown on the site')
ON CONFLICT (key) DO NOTHING;

-- 1. Admin Audit Log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text        NOT NULL,
  action      text        NOT NULL,
  target_table text,
  target_id   text,
  details     jsonb,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

-- Only accessible via service-role key (RLS blocks anon/user)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_audit_deny_all" ON admin_audit_log;
CREATE POLICY "admin_audit_deny_all" ON admin_audit_log FOR ALL USING (false);

-- 2. Index for fast log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action  ON admin_audit_log (action);

-- 3. Soft-ban columns on weddings (tracks ban via admin)
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS banned_at     timestamptz;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS banned_reason text;

-- 3b. Co-owner email column (for RSVP notification to secondary event owner)
--     ⚠️  THIS IS THE FIX — without this column co-owner notifications are silently skipped
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS co_owner_email text;

-- 4. Admin stats view (fast overview query)
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT count(*) FROM weddings)                                   AS total_weddings,
  (SELECT count(*) FROM weddings WHERE created_at > now() - interval '7 days') AS new_weddings_7d,
  (SELECT count(*) FROM guests)                                     AS total_guests,
  (SELECT count(*) FROM guests WHERE rsvp_status = 'confirmed')     AS confirmed_guests,
  (SELECT count(*) FROM gallery_photos)                             AS total_photos,
  (SELECT count(*) FROM weddings WHERE banned_at IS NOT NULL)       AS banned_weddings;
