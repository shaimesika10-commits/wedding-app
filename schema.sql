-- ============================================================
--  GrandInvite – Supabase SQL Schema
--  הרץ את הקוד הזה ב-Supabase SQL Editor
-- ============================================================

-- 1. הפעלת תוסף UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. טבלת משתמשים (זוגות)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. טבלת חתונות
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weddings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  slug              TEXT UNIQUE NOT NULL,            -- כתובת URL ייחודית: grandinvite.com/david-sarah
  bride_name        TEXT NOT NULL,
  groom_name        TEXT NOT NULL,
  wedding_date      DATE NOT NULL,
  venue_name        TEXT,
  venue_address     TEXT,
  venue_city        TEXT,
  venue_country     TEXT DEFAULT 'France',
  google_maps_url   TEXT,
  waze_url          TEXT,
  cover_image_url   TEXT,
  welcome_message   TEXT,
  rsvp_deadline     DATE,
  max_guests        INTEGER DEFAULT 200,             -- מגבלת Freemium
  plan              TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  font_style        TEXT DEFAULT 'cormorant' CHECK (font_style IN ('cormorant', 'playfair', 'eb-garamond', 'great-vibes')),
  locale            TEXT DEFAULT 'fr' CHECK (locale IN ('fr', 'he', 'en')),
  is_active         BOOLEAN DEFAULT TRUE,
  co_owner_email    TEXT,                               -- מייל בעל/ת שמחה נוסף/ת לקבלת התראות RSVP
  banned_at         TIMESTAMPTZ,                        -- תאריך חסימה (אדמין)
  banned_reason     TEXT,                               -- סיבת חסימה (אדמין)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. לוח זמנים אירוע (תמיכה בריבוי אירועים: טקס, מסיבה, בראנץ')
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_schedule (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id      UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  event_name      TEXT NOT NULL,                    -- "Cérémonie", "Dîner", "Brunch du lendemain"
  event_date      DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME,
  location_name   TEXT,
  address         TEXT,
  google_maps_url TEXT,
  waze_url        TEXT,
  description     TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. טבלת אורחים (לב המערכת)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id            UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  name                  TEXT NOT NULL,
  email                 TEXT,
  phone                 TEXT,
  adults_count          INTEGER DEFAULT 1 CHECK (adults_count >= 0),
  children_count        INTEGER DEFAULT 0 CHECK (children_count >= 0),
  dietary_preferences   TEXT,                       -- "Végétarien", "Casher", "Halal", "Sans gluten"
  allergies             TEXT,                       -- אלרגיות ספציפיות
  notes                 TEXT,                       -- שדה 'אחר / הערות נוספות' - פתוח לאורח
  rsvp_status           TEXT DEFAULT 'pending'
                          CHECK (rsvp_status IN ('confirmed', 'declined', 'pending')),
  rsvp_submitted_at     TIMESTAMPTZ,
  invitation_sent_at    TIMESTAMPTZ,
  table_number          INTEGER,                    -- לשימוש עתידי (סידורי הושבה)
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. גלריית תמונות שיתופית
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id            UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  uploaded_by_guest_id  UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  uploaded_by_name      TEXT,                       -- שם האורח שהעלה
  storage_path          TEXT,                        -- נתיב ב-Supabase Storage (נגזר מה-public_url)
  public_url            TEXT NOT NULL,
  caption               TEXT,
  approved              BOOLEAN DEFAULT FALSE,      -- אישור הזוג לפני פרסום
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. הפעלת Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.weddings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. Policies – Weddings
-- ============================================================
CREATE POLICY "owners_manage_weddings"
  ON public.weddings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_view_active_weddings"
  ON public.weddings FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- 9. Policies – Guests
-- ============================================================
CREATE POLICY "owners_manage_guests"
  ON public.guests FOR ALL
  USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
  );

-- כל אחד יכול להגיש RSVP (ללא לוגין)
CREATE POLICY "public_submit_rsvp"
  ON public.guests FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- 10. Policies – Event Schedule
-- ============================================================
CREATE POLICY "owners_manage_schedule"
  ON public.event_schedule FOR ALL
  USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
  );

CREATE POLICY "public_view_schedule"
  ON public.event_schedule FOR SELECT
  USING (TRUE);

-- ============================================================
-- 11. Policies – Gallery
-- ============================================================
CREATE POLICY "anyone_upload_photo"
  ON public.gallery_photos FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "public_view_approved_photos"
  ON public.gallery_photos FOR SELECT
  USING (approved = TRUE);

CREATE POLICY "owners_manage_gallery"
  ON public.gallery_photos FOR ALL
  USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
  );

-- ============================================================
-- 12. Policies – Users
-- ============================================================
CREATE POLICY "users_view_own_profile"
  ON public.users FOR ALL
  USING (auth.uid() = id);

-- ============================================================
-- 13. Indexes (לביצועים)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_weddings_slug        ON public.weddings(slug);
CREATE INDEX IF NOT EXISTS idx_weddings_user_id     ON public.weddings(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id    ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status   ON public.guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_schedule_wedding_id  ON public.event_schedule(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id   ON public.gallery_photos(wedding_id);

-- ============================================================
-- 14. Trigger – updated_at אוטומטי
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weddings_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 15. Storage Bucket לגלריה (הרץ ב-Supabase Dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('wedding-gallery', 'wedding-gallery', true);
