-- ============================================================
--  GrandInvite – Premium Tier Migration
--  Run this in Supabase SQL Editor (or via Management API)
--  Ensures the weddings table has all premium-related columns.
-- ============================================================

-- 1. Add plan column (free / premium) — safe if already exists
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'premium'));

-- 2. Ensure max_guests defaults to 200 for free accounts
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS max_guests INTEGER NOT NULL DEFAULT 200;

-- 3. co_owner_email — second contact for RSVP notifications (premium only)
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS co_owner_email TEXT DEFAULT NULL;

-- 4. notify_new_rsvp — flag controlling whether owner receives RSVP emails
--    For free accounts this will remain false; premium accounts get true automatically
--    (The RSVP route checks wedding.plan === 'premium', so this column is informational)
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS notify_new_rsvp BOOLEAN NOT NULL DEFAULT false;

-- 5. Set notify_new_rsvp = true for all existing premium weddings
UPDATE public.weddings
  SET notify_new_rsvp = true
  WHERE plan = 'premium';

-- 6. (Optional) index for plan queries
CREATE INDEX IF NOT EXISTS weddings_plan_idx ON public.weddings (plan);

-- 7. Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'weddings'
  AND column_name  IN ('plan', 'max_guests', 'co_owner_email', 'notify_new_rsvp')
ORDER BY column_name;
