-- ============================================================
-- SkipTheLine — Complete Supabase Database Schema
-- Version 2.0 — Final (post all audits)
--
-- Audits completed before this schema:
--   ✅ Feature Inventory
--   ✅ Feature-to-Schema Gap Analysis
--   ✅ Data Flow Audit
--   ✅ Analytics Instrumentation Audit (115 events)
--   ✅ B2B Report Assessment
--
-- Total tables: 41
-- Run in Supabase SQL Editor — Project Settings → SQL Editor
-- Enable RLS on every table (done below)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- EXTENSIONS
-- ════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;  -- for distance queries


-- ════════════════════════════════════════════════════════════
-- 1. USERS
-- ════════════════════════════════════════════════════════════

CREATE TABLE users (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id                   uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle                    text UNIQUE NOT NULL,
  name                      text NOT NULL,
  email                     text UNIQUE NOT NULL,
  phone                     text,
  avatar_url                text,
  avatar_initial            text,
  city                      text DEFAULT 'Miami',
  neighborhood              text,

  -- Auth & onboarding
  first_login_at            timestamptz,
  terms_accepted_at         timestamptz,
  terms_version             text,
  location_permission       text DEFAULT 'not_asked',  -- not_asked | granted | denied
  onboarding_completed      boolean DEFAULT false,
  onboarding_tour_completed boolean DEFAULT false,
  onboarding_tour_skipped   boolean DEFAULT false,
  onboarding_tour_step      int DEFAULT 0,

  -- Gamification
  points                    int NOT NULL DEFAULT 0,
  streak                    int NOT NULL DEFAULT 0,
  streak_last_date          date,
  rank                      int,
  rank_trend                text DEFAULT 'flat',        -- up | down | flat
  rank_delta                int DEFAULT 0,
  reports_count             int NOT NULL DEFAULT 0,
  reports_this_week         int NOT NULL DEFAULT 0,
  confirmations             int NOT NULL DEFAULT 0,

  -- Trust / Anomaly detection
  trust_score               int NOT NULL DEFAULT 100,   -- 0-100
  flagged_count             int NOT NULL DEFAULT 0,
  is_banned                 boolean NOT NULL DEFAULT false,
  ban_reason                text,

  -- Subscription (B2C)
  plan                      text NOT NULL DEFAULT 'free',  -- free | premium
  stripe_customer_id        text,
  subscription_id           text,
  subscription_status       text,

  -- Device
  push_token                text,
  last_known_lat            float,
  last_known_lng            float,
  last_location_at          timestamptz,

  -- Metadata
  joined_at                 timestamptz NOT NULL DEFAULT now(),
  last_active_at            timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);


-- ════════════════════════════════════════════════════════════
-- 2. AUTH EVENTS (login tracking, device info, fraud signals)
-- ════════════════════════════════════════════════════════════

CREATE TABLE auth_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type      text NOT NULL,  -- signup | login | logout | password_reset | token_refresh
  provider        text,           -- email | google | apple
  ip_hash         text,           -- hashed for privacy
  device_info     jsonb,          -- {platform, os_version, app_version, device_model}
  success         boolean DEFAULT true,
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_events_user_idx ON auth_events(user_id, created_at DESC);
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_events_service_only" ON auth_events USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 3. VENUES
-- ════════════════════════════════════════════════════════════

CREATE TABLE venues (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id       text UNIQUE,
  name                  text NOT NULL,
  slug                  text UNIQUE,

  -- Category
  category              text NOT NULL,  -- restaurants | barbershops | grocery | government | healthcare | retail | entertainment | landmarks | attractions
  category_label        text,
  subcategory           text,

  -- Location
  lat                   float NOT NULL,
  lng                   float NOT NULL,
  location              geography(POINT, 4326),  -- PostGIS point
  address               text,
  city                  text NOT NULL DEFAULT 'Miami',
  neighborhood          text,
  zip                   text,

  -- Info
  hours                 text,
  phone                 text,
  website               text,
  price_range           text,   -- $ | $$ | $$$ | $$$$
  vibe                  text,

  -- Nightclub/dayclub specific
  entry_type            text,   -- general | vip | guest_list
  is_nightclub          boolean DEFAULT false,
  is_dayclub            boolean DEFAULT false,

  -- Wait time
  current_wait_minutes  int DEFAULT 0,
  typical_wait_minutes  int DEFAULT 0,
  trend                 text DEFAULT 'flat',
  reports_count         int DEFAULT 0,
  live_reporters        int DEFAULT 0,
  last_report_at        timestamptz,
  last_report_minutes   int,
  severity              text,   -- short | moderate | long

  -- Ratings
  average_rating        float DEFAULT 0,
  google_rating         float,
  google_rating_count   int,

  -- Photos
  primary_image_url     text,
  google_photo_ref      text,

  -- Status
  is_active             boolean DEFAULT true,
  is_claimed            boolean DEFAULT false,
  is_verified           boolean DEFAULT false,
  source                text DEFAULT 'google',  -- google | user_submitted | manual
  submitted_by          uuid REFERENCES users(id),

  -- B2B
  has_smb_subscription  boolean DEFAULT false,
  smb_tier              text,   -- basic | pro | enterprise

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Auto-populate PostGIS point from lat/lng
CREATE OR REPLACE FUNCTION venues_set_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_location_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION venues_set_location();

CREATE INDEX venues_location_idx ON venues USING GIST(location);
CREATE INDEX venues_city_idx ON venues(city);
CREATE INDEX venues_category_idx ON venues(category);
CREATE INDEX venues_active_idx ON venues(is_active);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venues_public_read" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "venues_service_write" ON venues FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "venues_service_update" ON venues FOR UPDATE USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 4. VENUE HOURS (structured open/close per day)
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_hours (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id      uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week   int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),  -- 0=Sun
  open_time     time,
  close_time    time,
  is_closed     boolean DEFAULT false,
  is_24h        boolean DEFAULT false,
  UNIQUE(venue_id, day_of_week)
);

ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_hours_public_read" ON venue_hours FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 5. FEATURED VENUES (home screen carousel)
-- ════════════════════════════════════════════════════════════

CREATE TABLE featured_venues (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id      uuid REFERENCES venues(id) ON DELETE CASCADE,
  title         text NOT NULL,
  type          text,            -- Experience | Landmark | Art | Sponsored
  is_sponsored  boolean DEFAULT false,
  city          text DEFAULT 'Miami',
  sort_order    int DEFAULT 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE featured_venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "featured_venues_public_read" ON featured_venues FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 6. REPORTS (core wait time submissions)
-- ════════════════════════════════════════════════════════════

CREATE TABLE reports (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id               uuid REFERENCES users(id) ON DELETE SET NULL,

  -- Wait data
  wait_minutes          int NOT NULL,
  report_type           text,   -- walk-in | reservation | guest_list | vip | self-checkout | counter | appointment | other
  entry_type            text,   -- general | vip | guest_list (clubs)
  note                  text,   -- 140 char max

  -- Location verification
  user_lat              float,
  user_lng              float,
  location_verified     boolean DEFAULT false,
  distance_from_venue   float,  -- meters

  -- Anomaly detection
  anomaly_score         int DEFAULT 0,      -- 0-100
  flagged               boolean DEFAULT false,
  flag_reason           text,
  weight                float DEFAULT 1.0,  -- 0.0-1.0

  -- Time decay
  decay_weight          float DEFAULT 1.0,
  is_live               boolean DEFAULT true,

  -- Source tracking
  via_voice             boolean DEFAULT false,
  session_id            text,
  referral_source       text,   -- map_pin | search | friend_report | notification | direct

  -- Device (fraud detection)
  device_fingerprint    text,
  app_version           text,
  platform              text,   -- ios | android
  ip_hash               text,

  -- Confirmation
  confirmation_count    int DEFAULT 0,

  -- Points
  points_awarded        int DEFAULT 0,
  points_frozen         boolean DEFAULT false,

  created_at            timestamptz NOT NULL DEFAULT now(),
  expires_at            timestamptz   -- created_at + 45min, set by trigger
);

-- Auto-set expiry
CREATE OR REPLACE FUNCTION reports_set_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = NEW.created_at + INTERVAL '45 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_expiry_trigger
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION reports_set_expiry();

CREATE INDEX reports_venue_live_idx ON reports(venue_id, is_live, flagged, created_at DESC);
CREATE INDEX reports_user_idx ON reports(user_id, created_at DESC);
CREATE INDEX reports_created_idx ON reports(created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_public_read" ON reports FOR SELECT USING (true);
CREATE POLICY "reports_auth_insert" ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ════════════════════════════════════════════════════════════
-- 7. REPORT CONFIRMATIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE report_confirmations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id           uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  confirmed_by        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(report_id, confirmed_by)
);

ALTER TABLE report_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "confirmations_auth_insert" ON report_confirmations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "confirmations_public_read" ON report_confirmations FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 8. ANOMALY DETECTION
-- ════════════════════════════════════════════════════════════

CREATE TABLE anomaly_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  venue_id        uuid REFERENCES venues(id) ON DELETE CASCADE,
  signal_type     text NOT NULL,  -- statistical_outlier | velocity_abuse | location_mismatch | new_account_spam | pattern_anomaly | coordinated_attack
  score           int NOT NULL,
  details         jsonb,
  response_tier   int,            -- 1 | 2 | 3
  resolved        boolean DEFAULT false,
  resolved_by     uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bad_actor_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_type       text NOT NULL,
  venue_id        uuid REFERENCES venues(id),
  details         jsonb,
  flagged_at      timestamptz NOT NULL DEFAULT now(),
  reviewed        boolean DEFAULT false,
  action_taken    text  -- warned | suspended | banned | cleared
);

ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_actor_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anomaly_service_only" ON anomaly_events USING (auth.role() = 'service_role');
CREATE POLICY "bad_actor_service_only" ON bad_actor_flags USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 9. VENUE REVIEWS
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  source      text NOT NULL DEFAULT 'community',  -- google | community
  stars       int NOT NULL CHECK (stars >= 1 AND stars <= 5),
  text        text,
  author_name text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX venue_reviews_venue_idx ON venue_reviews(venue_id, created_at DESC);
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON venue_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON venue_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ════════════════════════════════════════════════════════════
-- 10. VENUE PHOTOS
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url             text NOT NULL,
  source          text DEFAULT 'google',  -- google | business_uploaded | user_submitted
  uploaded_by     uuid REFERENCES users(id),
  is_primary      boolean DEFAULT false,
  sort_order      int DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_read" ON venue_photos FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 11. EVENTS (event tagging)
-- ════════════════════════════════════════════════════════════

CREATE TABLE events (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id                uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name                    text NOT NULL,
  event_type              text,  -- special_event | performer | theme_night | holiday | sports
  description             text,
  start_time              timestamptz NOT NULL,
  end_time                timestamptz,
  expected_crowd_impact   text,  -- low | medium | high | extreme
  crowd_multiplier        float DEFAULT 1.0,
  is_active               boolean DEFAULT false,
  source                  text DEFAULT 'manual',  -- manual | business_submitted | user_reported | api
  created_by              uuid REFERENCES users(id),
  confirmed_by_count      int DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX events_venue_active_idx ON events(venue_id, is_active, start_time);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON events FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 12. WAIT TIME CACHE (computed current wait per venue)
-- ════════════════════════════════════════════════════════════

CREATE TABLE wait_time_cache (
  venue_id              uuid PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
  computed_wait         int NOT NULL DEFAULT 0,
  report_count          int DEFAULT 0,
  trusted_report_count  int DEFAULT 0,
  last_computed_at      timestamptz NOT NULL DEFAULT now(),
  computation_method    text,  -- crowd | google_fallback | historical
  confidence            float DEFAULT 0,
  has_live_data         boolean DEFAULT false
);

ALTER TABLE wait_time_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wait_cache_public_read" ON wait_time_cache FOR SELECT USING (true);
CREATE POLICY "wait_cache_service_write" ON wait_time_cache USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 13. WAIT DROP EVENTS (feeds explore + alerts)
-- ════════════════════════════════════════════════════════════

CREATE TABLE wait_drop_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  from_minutes    int NOT NULL,
  to_minutes      int NOT NULL,
  drop_pct        float,
  detected_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wait_drop_venue_idx ON wait_drop_events(venue_id, detected_at DESC);
ALTER TABLE wait_drop_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wait_drops_public_read" ON wait_drop_events FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 14. VENUE INTERACTIONS (B2B visibility + funnel analytics)
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_interactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  venue_id    uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  action      text NOT NULL,  -- map_pin_tap | list_tap | search_result | directions | report_tap | photo_view | share | favorite
  source      text,           -- map | list | search | notification | friend_feed
  session_id  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX venue_interactions_venue_idx ON venue_interactions(venue_id, created_at DESC);
CREATE INDEX venue_interactions_action_idx ON venue_interactions(venue_id, action, created_at DESC);

ALTER TABLE venue_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactions_auth_insert" ON venue_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "interactions_service_read" ON venue_interactions FOR SELECT USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 15. SEARCH QUERIES
-- ════════════════════════════════════════════════════════════

CREATE TABLE search_queries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE SET NULL,
  query               text NOT NULL,
  results_count       int DEFAULT 0,
  selected_venue_id   uuid REFERENCES venues(id) ON DELETE SET NULL,
  screen              text,  -- home | discover | report
  city                text DEFAULT 'Miami',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX search_queries_venue_idx ON search_queries(selected_venue_id);
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_service_read" ON search_queries FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "search_auth_insert" ON search_queries FOR INSERT WITH CHECK (true);


-- ════════════════════════════════════════════════════════════
-- 16. USER SESSIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE user_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  session_token   text UNIQUE,
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  duration_ms     int,
  screen_count    int DEFAULT 0,
  city            text,
  app_version     text,
  platform        text,  -- ios | android
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_service_read" ON user_sessions FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "sessions_auth_insert" ON user_sessions FOR INSERT WITH CHECK (true);


-- ════════════════════════════════════════════════════════════
-- 17. FEED EVENTS (explore screen live feed)
-- ════════════════════════════════════════════════════════════

CREATE TABLE feed_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL,  -- venue | drop | report | system | badge | quest
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  venue_id    uuid REFERENCES venues(id) ON DELETE CASCADE,
  report_id   uuid REFERENCES reports(id) ON DELETE SET NULL,
  data        jsonb NOT NULL,
  city        text DEFAULT 'Miami',
  is_public   boolean DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX feed_events_city_idx ON feed_events(city, created_at DESC);
CREATE INDEX feed_events_kind_idx ON feed_events(kind, created_at DESC);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_events_public_read" ON feed_events FOR SELECT USING (is_public = true);


-- ════════════════════════════════════════════════════════════
-- 18. ACTIVITY HISTORY
-- ════════════════════════════════════════════════════════════

CREATE TABLE activity_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,  -- report | badge | quest | redemption | friend_add
  venue_id    uuid REFERENCES venues(id),
  venue_name  text,
  wait_minutes int,
  points      int DEFAULT 0,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX activity_history_user_idx ON activity_history(user_id, created_at DESC);
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_own_read" ON activity_history FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 19. COMMUNITY IMPACT SNAPSHOTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE community_impact_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period          text NOT NULL,  -- weekly | monthly | all_time
  period_start    date NOT NULL,
  reports_count   int DEFAULT 0,
  people_helped   int DEFAULT 0,
  confirmations   int DEFAULT 0,
  xp_earned       int DEFAULT 0,
  city            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period, period_start)
);

ALTER TABLE community_impact_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impact_own_read" ON community_impact_snapshots FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 20. GAMIFICATION — POINTS LEDGER
-- ════════════════════════════════════════════════════════════

CREATE TABLE points_ledger (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      int NOT NULL,
  type        text NOT NULL,  -- report | confirmation | streak_bonus | quest | referral | redemption | penalty
  source_id   uuid,
  source_type text,
  description text,
  balance     int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX points_ledger_user_idx ON points_ledger(user_id, created_at DESC);
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points_own_read" ON points_ledger FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 21. GAMIFICATION — TIERS
-- ════════════════════════════════════════════════════════════

CREATE TABLE tiers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  emoji       text NOT NULL,
  min_points  int NOT NULL,
  max_points  int NOT NULL,
  perks       text[],
  sort_order  int NOT NULL
);

INSERT INTO tiers (name, emoji, min_points, max_points, perks, sort_order) VALUES
  ('Scout',   '🥉', 0,    1000,  ARRAY['Basic vouchers'], 1),
  ('Ranger',  '🥈', 1000, 2500,  ARRAY['2x weekend points'], 2),
  ('Captain', '🥇', 2500, 5000,  ARRAY['Skip-line passes', 'Premium vouchers'], 3),
  ('Legend',  '👑', 5000, 10000, ARRAY['VIP events', 'Founder badge'], 4);

ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiers_public_read" ON tiers FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 22. GAMIFICATION — BADGES
-- ════════════════════════════════════════════════════════════

CREATE TABLE badge_definitions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  emoji         text NOT NULL,
  description   text NOT NULL,
  criteria      jsonb NOT NULL,
  points_reward int DEFAULT 0,
  is_active     boolean DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO badge_definitions (name, emoji, description, criteria, points_reward) VALUES
  ('First Drop',  '🎯', 'Submit your first report',          '{"type":"reports_count","threshold":1}',   50),
  ('Night Owl',   '🦉', 'Report after midnight',             '{"type":"after_midnight","count":1}',       25),
  ('Streak x10',  '🔥', '10-day reporting streak',           '{"type":"streak","threshold":10}',          100),
  ('Local Hero',  '🏆', 'Top reporter in your area',         '{"type":"local_rank","threshold":10}',      200),
  ('Event Scout', '🎪', 'Report at a special event',         '{"type":"event_report","count":1}',         75),
  ('100 Club',    '💯', 'Submit 100 reports',                '{"type":"reports_count","threshold":100}',  500),
  ('Speed Run',   '⚡', 'Report within 1min of arrival',     '{"type":"speed_report","seconds":60}',      50),
  ('City Expert', '🗺️', 'Report from 20+ unique venues',    '{"type":"unique_venues","threshold":20}',   150);

CREATE TABLE user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id    uuid NOT NULL REFERENCES badge_definitions(id),
  earned_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_public_read" ON badge_definitions FOR SELECT USING (true);
CREATE POLICY "user_badges_own_read" ON user_badges FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 23. GAMIFICATION — QUESTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE quest_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL,
  emoji       text,
  quest_type  text NOT NULL,  -- daily | weekly | one_time | special
  goal        int NOT NULL,
  reward      int NOT NULL,
  criteria    jsonb NOT NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO quest_definitions (title, description, emoji, quest_type, goal, reward, criteria) VALUES
  ('Drop 3 reports today',     'Help your neighborhood stay fresh', '📍', 'daily',  3,  75,  '{"action":"report","count":3}'),
  ('Confirm a friend''s report','Back up the community',            '🤝', 'daily',  1,  25,  '{"action":"confirm","count":1}'),
  ('Scout a new venue',        'First report on an unmapped spot',  '🧭', 'weekly', 1,  150, '{"action":"first_report_at_venue","count":1}'),
  ('Maintain 14-day streak',   'Two weeks of consistent reporting', '🔥', 'weekly', 14, 200, '{"action":"streak","days":14}');

CREATE TABLE user_quest_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id      uuid NOT NULL REFERENCES quest_definitions(id),
  progress      int NOT NULL DEFAULT 0,
  completed     boolean DEFAULT false,
  completed_at  timestamptz,
  period_start  date NOT NULL,
  UNIQUE(user_id, quest_id, period_start)
);

ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quests_public_read" ON quest_definitions FOR SELECT USING (true);
CREATE POLICY "quest_progress_own_read" ON user_quest_progress FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 24. GAMIFICATION — REWARDS
-- ════════════════════════════════════════════════════════════

CREATE TABLE reward_definitions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  brand         text NOT NULL,
  description   text,
  cost_points   int NOT NULL,
  emoji         text,
  is_active     boolean DEFAULT true,
  inventory     int,
  venue_id      uuid REFERENCES venues(id),
  expiry_days   int DEFAULT 30,
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO reward_definitions (title, brand, cost_points, emoji) VALUES
  ('20% off entrée', 'Joe''s Stone Crab', 1500, '🦀'),
  ('Free fade',      'LA Barber Co.',     2000, '💈'),
  ('VIP entry',      'Story Nightclub',   3500, '🎟️'),
  ('Skip-line pass', 'Komodo',            5000, '⚡');

CREATE TABLE reward_redemptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id     uuid NOT NULL REFERENCES reward_definitions(id),
  points_spent  int NOT NULL,
  code          text UNIQUE,
  status        text DEFAULT 'active',  -- active | used | expired
  redeemed_at   timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reward_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards_public_read" ON reward_definitions FOR SELECT USING (is_active = true);
CREATE POLICY "redemptions_own_read" ON reward_redemptions FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 25. GAMIFICATION — LEADERBOARD
-- ════════════════════════════════════════════════════════════

CREATE TABLE leaderboard_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope         text NOT NULL,  -- global | city | neighborhood
  city          text,
  neighborhood  text,
  period        text NOT NULL,  -- weekly | monthly | all_time
  period_start  date NOT NULL,
  rank          int NOT NULL,
  points        int NOT NULL,
  reports       int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, period, period_start)
);

ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_public_read" ON leaderboard_snapshots FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 26. SOCIAL — FRIENDS
-- ════════════════════════════════════════════════════════════

CREATE TABLE friendships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending',  -- pending | accepted | blocked
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK(requester_id != addressee_id)
);

CREATE INDEX friendships_requester_idx ON friendships(requester_id, status);
CREATE INDEX friendships_addressee_idx ON friendships(addressee_id, status);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friendships_own_read" ON friendships FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = requester_id) OR
  auth.uid() = (SELECT auth_id FROM users WHERE id = addressee_id)
);
CREATE POLICY "friendships_auth_insert" ON friendships FOR INSERT WITH CHECK (
  auth.uid() = (SELECT auth_id FROM users WHERE id = requester_id)
);


-- ════════════════════════════════════════════════════════════
-- 27. SOCIAL — FAVORITES
-- ════════════════════════════════════════════════════════════

CREATE TABLE favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id    uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own_manage" ON favorites USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 28. REFERRAL CODES
-- ════════════════════════════════════════════════════════════

CREATE TABLE referral_codes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code                text UNIQUE NOT NULL,
  used_count          int DEFAULT 0,
  points_per_referral int DEFAULT 100,
  expires_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE referral_uses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id           uuid NOT NULL REFERENCES referral_codes(id),
  referred_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_awarded    int DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)  -- can only be referred once
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_own_read" ON referral_codes FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 29. NOTIFICATIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE notification_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  arrival_nudge       boolean DEFAULT true,
  wait_drop_alerts    boolean DEFAULT true,
  friend_activity     boolean DEFAULT true,
  quest_reminders     boolean DEFAULT true,
  badge_earned        boolean DEFAULT true,
  points_awarded      boolean DEFAULT true,
  marketing           boolean DEFAULT false,
  quiet_hours_start   time,
  quiet_hours_end     time,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            text NOT NULL,  -- arrival_nudge | wait_drop | quest | badge | friend_report | system
  title           text NOT NULL,
  body            text NOT NULL,
  data            jsonb,
  sent_at         timestamptz NOT NULL DEFAULT now(),
  opened_at       timestamptz,
  push_ticket_id  text
);

CREATE INDEX notification_log_user_idx ON notification_log(user_id, sent_at DESC);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_own" ON notification_preferences USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);
CREATE POLICY "notif_log_own_read" ON notification_log FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 30. AMBIENT INTELLIGENCE — ARRIVAL NUDGE + WAIT DROP ALERTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE arrival_nudge_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  nudge_type      text NOT NULL,  -- arrival | pre_departure | post_visit
  triggered_at    timestamptz NOT NULL DEFAULT now(),
  dwell_minutes   int,
  response        text,           -- reported | ignored | later | null
  report_id       uuid REFERENCES reports(id),
  intent_signals  jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wait_drop_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  threshold       int NOT NULL,
  is_active       boolean DEFAULT true,
  fired_count     int DEFAULT 0,
  last_fired_at   timestamptz,
  user_acted      boolean,
  user_reported   boolean,
  report_id       uuid REFERENCES reports(id),
  triggered_at    timestamptz,
  wait_at_trigger int,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE arrival_nudge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wait_drop_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nudge_log_own_read" ON arrival_nudge_log FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);
CREATE POLICY "wait_alerts_own_manage" ON wait_drop_alerts USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 31. VOICE AI SESSIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE voice_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id      text UNIQUE,
  duration_secs   int,
  intent          text,  -- check_wait | report_wait | set_alert | recommend | other
  venue_id        uuid REFERENCES venues(id),
  report_id       uuid REFERENCES reports(id),
  transcript      text,
  cost_cents      int,
  status          text DEFAULT 'completed',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voice_own_read" ON voice_sessions FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 32. BLE BEACONS (Phase 2 B2B)
-- ════════════════════════════════════════════════════════════

CREATE TABLE ble_beacons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  beacon_uuid     text NOT NULL UNIQUE,
  major           int,
  minor           int,
  name            text,
  is_active       boolean DEFAULT true,
  installed_at    timestamptz,
  last_seen_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE beacon_detections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  beacon_id       uuid NOT NULL REFERENCES ble_beacons(id),
  venue_id        uuid NOT NULL REFERENCES venues(id),
  detected_at     timestamptz NOT NULL DEFAULT now(),
  rssi            int,
  triggered_nudge boolean DEFAULT false
);

ALTER TABLE ble_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beacons_service_only" ON ble_beacons USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- 33. B2B — BUSINESS ACCOUNTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE business_accounts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name           text NOT NULL,
  contact_email           text NOT NULL,
  contact_phone           text,
  billing_email           text,
  plan                    text NOT NULL DEFAULT 'basic',  -- basic ($29) | pro ($99) | enterprise ($199)
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_status     text DEFAULT 'active',
  trial_ends_at           timestamptz,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  is_verified             boolean DEFAULT false,
  verification_method     text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE business_venue_claims (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  venue_id      uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  is_primary    boolean DEFAULT false,
  claimed_at    timestamptz NOT NULL DEFAULT now(),
  verified_at   timestamptz,
  UNIQUE(business_id, venue_id)
);

CREATE TABLE business_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'viewer',  -- owner | admin | viewer
  invited_by    uuid REFERENCES users(id),
  joined_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_venue_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_own_read" ON business_accounts FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
);


-- ════════════════════════════════════════════════════════════
-- 34. B2B — VENUE ANALYTICS (hourly + daily)
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_analytics_hourly (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  hour                  timestamptz NOT NULL,
  day_of_week           int,
  report_count          int DEFAULT 0,
  avg_wait_minutes      float,
  min_wait_minutes      int,
  max_wait_minutes      int,
  trusted_report_count  int DEFAULT 0,
  flagged_report_count  int DEFAULT 0,
  unique_reporters      int DEFAULT 0,
  repeat_reporter_count int DEFAULT 0,
  live_reporter_peak    int DEFAULT 0,
  confirmation_count    int DEFAULT 0,
  report_type_breakdown jsonb,  -- {"walk-in": 8, "reservation": 3, "vip": 1}
  UNIQUE(venue_id, hour)
);

CREATE TABLE venue_analytics_daily (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  report_count          int DEFAULT 0,
  avg_wait_minutes      float,
  peak_wait_minutes     int,
  peak_hour             int,
  unique_reporters      int DEFAULT 0,
  new_reporters         int DEFAULT 0,
  repeat_reporter_count int DEFAULT 0,
  view_count            int DEFAULT 0,
  direction_taps        int DEFAULT 0,
  report_taps           int DEFAULT 0,
  search_appearances    int DEFAULT 0,
  favorites_added       int DEFAULT 0,
  avg_reporter_trust    float,
  accuracy_score        float,
  report_type_breakdown jsonb,
  event_id              uuid REFERENCES events(id),
  UNIQUE(venue_id, date)
);

CREATE INDEX venue_analytics_hourly_idx ON venue_analytics_hourly(venue_id, hour DESC);
CREATE INDEX venue_analytics_daily_idx ON venue_analytics_daily(venue_id, date DESC);

ALTER TABLE venue_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_analytics_daily ENABLE ROW LEVEL SECURITY;
-- Business members can read their own venue analytics
CREATE POLICY "analytics_business_read" ON venue_analytics_hourly FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = venue_analytics_hourly.venue_id
    AND u.auth_id = auth.uid()
  )
);
CREATE POLICY "analytics_daily_business_read" ON venue_analytics_daily FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = venue_analytics_daily.venue_id
    AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 35. B2B — COMPETITOR SNAPSHOTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE competitor_snapshots (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_venue_id          uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  competitor_venue_id         uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date                        date NOT NULL,
  avg_wait_minutes            float,
  peak_wait_minutes           int,
  report_count                int,
  category                    text,
  distance_meters             float,
  anonymized_id               text NOT NULL,
  rank_in_category            int,
  percentile                  float,
  reveal_name                 boolean DEFAULT false,  -- enterprise only
  UNIQUE(reference_venue_id, competitor_venue_id, date)
);

ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitor_business_read" ON competitor_snapshots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = competitor_snapshots.reference_venue_id
    AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 36. B2B — CUSTOMER FLOW
-- ════════════════════════════════════════════════════════════

CREATE TABLE customer_flow_snapshots (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  hour                  int NOT NULL,
  arrivals_estimated    int,
  avg_dwell_minutes     float,
  drop_off_count        int,
  report_to_arrival_lag float,
  UNIQUE(venue_id, date, hour)
);

ALTER TABLE customer_flow_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flow_business_read" ON customer_flow_snapshots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = customer_flow_snapshots.venue_id
    AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 37. B2B — EVENT IMPACT ANALYTICS
-- ════════════════════════════════════════════════════════════

CREATE TABLE event_impact_analytics (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id                        uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  event_id                        uuid REFERENCES events(id),
  event_name                      text NOT NULL,
  event_date                      date NOT NULL,
  baseline_avg_wait               float,
  actual_avg_wait                 float,
  wait_delta                      float,
  report_count_event              int,
  report_count_baseline           int,
  peak_wait_during_event          int,
  competitor_avg_wait_during      float,   -- anonymized competitor avg during event
  competitor_avg_wait_baseline    float,   -- their normal baseline
  created_at                      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_impact_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_impact_business_read" ON event_impact_analytics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = event_impact_analytics.venue_id
    AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 38. B2B — REPORTER QUALITY
-- ════════════════════════════════════════════════════════════

CREATE TABLE venue_reporter_quality (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  total_reports         int DEFAULT 0,
  trusted_reports       int DEFAULT 0,
  flagged_reports       int DEFAULT 0,
  avg_reporter_trust    float,
  confirmed_reports     int DEFAULT 0,
  accuracy_score        float,
  new_reporters         int DEFAULT 0,
  repeat_reporters      int DEFAULT 0,
  report_type_breakdown jsonb,
  UNIQUE(venue_id, date)
);

ALTER TABLE venue_reporter_quality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter_quality_business_read" ON venue_reporter_quality FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_venue_claims bvc
    JOIN business_members bm ON bm.business_id = bvc.business_id
    JOIN users u ON u.id = bm.user_id
    WHERE bvc.venue_id = venue_reporter_quality.venue_id
    AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 39. B2B — SMB ALERTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE smb_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  venue_id        uuid REFERENCES venues(id),
  alert_type      text NOT NULL,  -- wait_spike | wait_drop | competitor_surge | new_event | weekly_report
  threshold       int,
  actual_value    int,
  message         text,
  sent_at         timestamptz NOT NULL DEFAULT now(),
  channel         text,           -- email | sms | push
  opened_at       timestamptz
);

ALTER TABLE smb_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "smb_alerts_business_read" ON smb_alerts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_accounts ba JOIN users u ON u.id = ba.user_id
    WHERE ba.id = smb_alerts.business_id AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 40. B2B — DASHBOARD SETTINGS
-- ════════════════════════════════════════════════════════════

CREATE TABLE business_dashboard_settings (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id               uuid NOT NULL UNIQUE REFERENCES business_accounts(id) ON DELETE CASCADE,
  competitor_radius_meters  int DEFAULT 1000,
  show_competitor_names     boolean DEFAULT false,  -- enterprise only
  alert_wait_spike          int DEFAULT 30,
  alert_email               text,
  alert_sms                 text,
  weekly_report_email       boolean DEFAULT true,
  updated_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE business_dashboard_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_settings_own" ON business_dashboard_settings USING (
  EXISTS (
    SELECT 1 FROM business_accounts ba JOIN users u ON u.id = ba.user_id
    WHERE ba.id = business_dashboard_settings.business_id AND u.auth_id = auth.uid()
  )
);


-- ════════════════════════════════════════════════════════════
-- 41. APP CONFIG
-- ════════════════════════════════════════════════════════════

CREATE TABLE app_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_config (key, value, description) VALUES
  ('wait_decay_minutes',      '45',                                           'Minutes before a report fully expires'),
  ('trust_score_threshold',   '60',                                           'Min trust score for full-weight reports'),
  ('anomaly_score_exclude',   '70',                                           'Anomaly score at which report is excluded'),
  ('points_per_report',       '10',                                           'Base SkipPoints per valid report'),
  ('points_first_report',     '15',                                           'Bonus for first report at a venue'),
  ('points_confirmation',     '5',                                            'Points for confirming another report'),
  ('decay_weights',           '{"10":1.0,"20":0.7,"30":0.4,"45":0.15}',      'Time-decay weight at minutes elapsed'),
  ('launch_cities',           '["Miami"]',                                    'Active launch cities'),
  ('b2b_plans',               '{"basic":29,"pro":99,"enterprise":199}',       'B2B plan pricing USD/mo'),
  ('wait_drop_threshold_pct', '20',                                           'Pct drop that triggers a wait_drop_event'),
  ('min_reports_for_live',    '2',                                            'Min reports before showing live data');

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_service_only" ON app_config USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- COMPLETE TABLE LIST (41 tables)
-- ════════════════════════════════════════════════════════════
--
-- AUTH + USERS (2)
--   users, auth_events
--
-- VENUES (4)
--   venues, venue_hours, featured_venues, venue_photos
--
-- CORE DATA (7)
--   reports, report_confirmations, venue_reviews, events,
--   wait_time_cache, wait_drop_events, venue_interactions
--
-- SEARCH + SESSIONS (2)
--   search_queries, user_sessions
--
-- ANOMALY DETECTION (2)
--   anomaly_events, bad_actor_flags
--
-- FEED + ACTIVITY (3)
--   feed_events, activity_history, community_impact_snapshots
--
-- GAMIFICATION (9)
--   points_ledger, tiers, badge_definitions, user_badges,
--   quest_definitions, user_quest_progress,
--   reward_definitions, reward_redemptions, leaderboard_snapshots
--
-- SOCIAL (3)
--   friendships, favorites, referral_codes, referral_uses
--
-- NOTIFICATIONS + AMBIENT (3)
--   notification_preferences, notification_log,
--   arrival_nudge_log, wait_drop_alerts
--
-- VOICE + BLE (3)
--   voice_sessions, ble_beacons, beacon_detections
--
-- B2B DASHBOARD (9)
--   business_accounts, business_venue_claims, business_members,
--   venue_analytics_hourly, venue_analytics_daily,
--   competitor_snapshots, customer_flow_snapshots,
--   event_impact_analytics, venue_reporter_quality,
--   smb_alerts, business_dashboard_settings
--
-- ADMIN (1)
--   app_config
-- ════════════════════════════════════════════════════════════
