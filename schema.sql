-- =============================================
-- SkipTheLine — Complete Supabase Schema
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. USERS
-- =============================================
create table if not exists public.users (
  id                uuid primary key default uuid_generate_v4(),
  email             text unique not null,
  display_name      text not null,
  handle            text unique not null,
  avatar_emoji      text default '🙂',
  avatar_url        text,
  city              text,
  neighborhood      text,
  phone             text,
  skip_points       integer default 0,
  streak_days       integer default 0,
  streak_last_date  date,
  total_reports     integer default 0,
  reports_this_week integer default 0,
  rank_city         integer,
  rank_global       integer,
  rank_trend        text default 'flat',
  rank_delta        integer default 0,
  theme             text default 'dark',
  notifications_on  boolean default true,
  joined_at         timestamptz default now(),
  last_active_at    timestamptz
);

-- =============================================
-- 2. VENUES
-- =============================================
create table if not exists public.venues (
  id                uuid primary key default uuid_generate_v4(),
  google_place_id   text unique,
  name              text not null,
  category          text not null,
  category_label    text,
  address           text,
  city              text not null,
  neighborhood      text,
  lat               numeric(9,6) not null,
  lng               numeric(9,6) not null,
  hours             text,
  phone             text,
  website           text,
  image_url         text,
  photo_reference   text,
  vibe              text,
  google_rating     numeric(2,1),
  price_level       integer,
  is_open_now       boolean,
  data_source       text default 'google_places',
  claimed_by        uuid references public.users(id),
  claimed_at        timestamptz,
  is_verified       boolean default false,
  imported_at       timestamptz default now()
);

-- =============================================
-- 3. WAIT REPORTS
-- =============================================
create table if not exists public.wait_reports (
  id                uuid primary key default uuid_generate_v4(),
  venue_id          uuid references public.venues(id) not null,
  user_id           uuid references public.users(id),
  wait_minutes      integer not null,
  report_type       text default 'manual',
  severity          text,
  quote             text,
  entry_type        text,
  confidence        numeric(3,2),
  confirmed_count   integer default 0,
  reported_at       timestamptz default now(),
  visit_started_at  timestamptz,
  is_ambient        boolean default false
);

-- =============================================
-- 4. VENUE WAIT STATE (cached current wait)
-- =============================================
create table if not exists public.venue_wait_state (
  venue_id              uuid primary key references public.venues(id),
  current_wait_minutes  integer,
  severity              text,
  trend                 text default 'flat',
  reports_count         integer default 0,
  last_report_at        timestamptz,
  last_reporter_id      uuid references public.users(id),
  live_reporters        integer default 0,
  typical_wait_minutes  integer,
  active_event          text,
  updated_at            timestamptz default now()
);

-- =============================================
-- 5. REPORT CONFIRMATIONS
-- =============================================
create table if not exists public.report_confirmations (
  id            uuid primary key default uuid_generate_v4(),
  report_id     uuid references public.wait_reports(id) not null,
  user_id       uuid references public.users(id) not null,
  confirmed_at  timestamptz default now(),
  unique(report_id, user_id)
);

-- =============================================
-- 6. FAVORITES
-- =============================================
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) not null,
  venue_id    uuid references public.venues(id) not null,
  created_at  timestamptz default now(),
  unique(user_id, venue_id)
);

-- =============================================
-- 7. BADGES + USER BADGES
-- =============================================
create table if not exists public.badges (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  name         text not null,
  emoji        text not null,
  description  text,
  criteria     jsonb
);

create table if not exists public.user_badges (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) not null,
  badge_id   uuid references public.badges(id) not null,
  earned_at  timestamptz default now(),
  unique(user_id, badge_id)
);

insert into public.badges (slug, name, emoji, description, criteria) values
  ('first_drop',  'First Drop',  '🎯', 'Submit your first wait time report', '{"reports": 1}'),
  ('night_owl',   'Night Owl',   '🦉', 'Report 5 venues after 11pm',         '{"reports_after_11pm": 5}'),
  ('streak_10',   'Streak x10',  '🔥', 'Report 10 days in a row',            '{"streak_days": 10}'),
  ('local_hero',  'Local Hero',  '🏆', 'Top reporter in your neighborhood',  '{"neighborhood_rank": 1}'),
  ('event_scout', 'Event Scout', '🎪', 'Report during 5 live events',        '{"event_reports": 5}'),
  ('club_100',    '100 Club',    '💯', 'Submit 100 total reports',           '{"total_reports": 100}')
on conflict (slug) do nothing;

-- =============================================
-- 8. TIERS
-- =============================================
create table if not exists public.tiers (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  emoji       text not null,
  min_points  integer not null,
  max_points  integer not null,
  perks       text[],
  sort_order  integer
);

insert into public.tiers (slug, name, emoji, min_points, max_points, perks, sort_order) values
  ('scout',   'Scout',   '🥉', 0,    1000,  array['Basic vouchers'],                          1),
  ('ranger',  'Ranger',  '🥈', 1000, 2500,  array['2x weekend points'],                       2),
  ('captain', 'Captain', '🥇', 2500, 5000,  array['Skip-line passes', 'Premium vouchers'],    3),
  ('legend',  'Legend',  '👑', 5000, 10000, array['VIP events', 'Founder badge'],              4)
on conflict (slug) do nothing;

-- =============================================
-- 9. QUESTS + USER QUEST PROGRESS
-- =============================================
create table if not exists public.quests (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  description   text,
  reward_points integer not null,
  goal          integer not null,
  emoji         text,
  quest_type    text not null,
  is_active     boolean default true
);

create table if not exists public.user_quest_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) not null,
  quest_id     uuid references public.quests(id) not null,
  progress     integer default 0,
  completed    boolean default false,
  period_start date not null,
  completed_at timestamptz,
  unique(user_id, quest_id, period_start)
);

insert into public.quests (slug, title, description, reward_points, goal, emoji, quest_type) values
  ('daily_3_reports',  'Drop 3 reports today',      'Help your neighborhood stay fresh', 75,  3,  '📍', 'daily'),
  ('daily_confirm',    'Confirm a friend''s report', 'Back up the community',             25,  1,  '🤝', 'daily'),
  ('weekly_new_venue', 'Scout a new venue',          'First report on an unmapped spot',  150, 1,  '🧭', 'weekly'),
  ('weekly_streak_14', 'Maintain 14-day streak',     'Report every day for two weeks',    200, 14, '🔥', 'weekly')
on conflict (slug) do nothing;

-- =============================================
-- 10. REWARDS + USER REWARDS
-- =============================================
create table if not exists public.rewards (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  brand        text not null,
  venue_id     uuid references public.venues(id),
  cost_points  integer not null,
  emoji        text,
  is_active    boolean default true,
  expires_at   timestamptz
);

create table if not exists public.user_rewards (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) not null,
  reward_id   uuid references public.rewards(id) not null,
  redeemed    boolean default false,
  redeemed_at timestamptz,
  unlocked_at timestamptz default now(),
  unique(user_id, reward_id)
);

-- =============================================
-- 11. SKIP POINTS LEDGER
-- =============================================
create table if not exists public.skip_points_ledger (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) not null,
  delta        integer not null,
  reason       text not null,
  reference_id uuid,
  created_at   timestamptz default now()
);

-- =============================================
-- 12. FRIENDSHIPS
-- =============================================
create table if not exists public.friendships (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid references public.users(id) not null,
  addressee_id uuid references public.users(id) not null,
  status       text default 'pending',
  created_at   timestamptz default now(),
  updated_at   timestamptz,
  unique(requester_id, addressee_id)
);

-- =============================================
-- 13. EVENTS
-- =============================================
create table if not exists public.events (
  id                     uuid primary key default uuid_generate_v4(),
  venue_id               uuid references public.venues(id) not null,
  name                   text not null,
  performer              text,
  genre                  text,
  event_type             text,
  starts_at              timestamptz,
  ends_at                timestamptz,
  ticket_url             text,
  image_url              text,
  min_ticket_price       numeric(8,2),
  max_ticket_price       numeric(8,2),
  crowd_multiplier       numeric(3,1) default 1.0,
  source                 text default 'business',
  external_id            text unique,
  confirmed_report_count integer default 0,
  is_active              boolean default true,
  created_at             timestamptz default now()
);

-- =============================================
-- 14. NOTIFICATIONS
-- =============================================
create table if not exists public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) not null,
  type         text not null,
  title        text not null,
  body         text,
  emoji        text,
  reference_id uuid,
  read         boolean default false,
  created_at   timestamptz default now()
);

-- =============================================
-- 15. LEADERBOARD GEO + USER GEO RANK
-- =============================================
create table if not exists public.leaderboard_geo (
  id             uuid primary key default uuid_generate_v4(),
  slug           text unique not null,
  name           text not null,
  scope          text not null,
  parent_id      uuid references public.leaderboard_geo(id),
  reporter_count integer default 0,
  top_user_id    uuid references public.users(id),
  updated_at     timestamptz default now()
);

create table if not exists public.user_geo_rank (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) not null,
  geo_id     uuid references public.leaderboard_geo(id) not null,
  points     integer default 0,
  rank       integer,
  trend      text default 'flat',
  rank_delta integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, geo_id)
);

insert into public.leaderboard_geo (slug, name, scope, parent_id) values
  ('fl',          'Florida',     'state',        null),
  ('miami',       'Miami',       'city',         (select id from public.leaderboard_geo where slug = 'fl')),
  ('orlando',     'Orlando',     'city',         (select id from public.leaderboard_geo where slug = 'fl')),
  ('tampa',       'Tampa',       'city',         (select id from public.leaderboard_geo where slug = 'fl')),
  ('wynwood',     'Wynwood',     'neighborhood', (select id from public.leaderboard_geo where slug = 'miami')),
  ('brickell',    'Brickell',    'neighborhood', (select id from public.leaderboard_geo where slug = 'miami')),
  ('south-beach', 'South Beach', 'neighborhood', (select id from public.leaderboard_geo where slug = 'miami')),
  ('midtown',     'Midtown',     'neighborhood', (select id from public.leaderboard_geo where slug = 'miami'))
on conflict (slug) do nothing;

-- =============================================
-- 16. VENUE PHOTOS
-- =============================================
create table if not exists public.venue_photos (
  id          uuid primary key default uuid_generate_v4(),
  venue_id    uuid references public.venues(id) not null,
  url         text not null,
  source      text default 'google',
  uploaded_by uuid references public.users(id),
  is_primary  boolean default false,
  created_at  timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_venues_city         on public.venues(city);
create index if not exists idx_venues_category     on public.venues(category);
create index if not exists idx_venues_lat_lng      on public.venues(lat, lng);
create index if not exists idx_wait_reports_venue  on public.wait_reports(venue_id);
create index if not exists idx_wait_reports_user   on public.wait_reports(user_id);
create index if not exists idx_wait_reports_time   on public.wait_reports(reported_at desc);
create index if not exists idx_favorites_user      on public.favorites(user_id);
create index if not exists idx_notifications_user  on public.notifications(user_id, read);
create index if not exists idx_ledger_user         on public.skip_points_ledger(user_id);
create index if not exists idx_events_venue        on public.events(venue_id);
create index if not exists idx_events_active       on public.events(is_active, starts_at);
create index if not exists idx_friendships_users   on public.friendships(requester_id, addressee_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.users               enable row level security;
alter table public.venues              enable row level security;
alter table public.wait_reports        enable row level security;
alter table public.venue_wait_state    enable row level security;
alter table public.report_confirmations enable row level security;
alter table public.favorites           enable row level security;
alter table public.badges              enable row level security;
alter table public.user_badges         enable row level security;
alter table public.tiers               enable row level security;
alter table public.quests              enable row level security;
alter table public.user_quest_progress enable row level security;
alter table public.rewards             enable row level security;
alter table public.user_rewards        enable row level security;
alter table public.skip_points_ledger  enable row level security;
alter table public.friendships         enable row level security;
alter table public.events              enable row level security;
alter table public.notifications       enable row level security;
alter table public.leaderboard_geo     enable row level security;
alter table public.user_geo_rank       enable row level security;
alter table public.venue_photos        enable row level security;

-- Public read (venues, wait times, events, leaderboard)
create policy "venues_public_read"            on public.venues             for select using (true);
create policy "wait_reports_public_read"      on public.wait_reports       for select using (true);
create policy "venue_wait_state_public_read"  on public.venue_wait_state   for select using (true);
create policy "badges_public_read"            on public.badges             for select using (true);
create policy "user_badges_public_read"       on public.user_badges        for select using (true);
create policy "tiers_public_read"             on public.tiers              for select using (true);
create policy "quests_public_read"            on public.quests             for select using (true);
create policy "rewards_public_read"           on public.rewards            for select using (true);
create policy "events_public_read"            on public.events             for select using (true);
create policy "leaderboard_geo_public_read"   on public.leaderboard_geo    for select using (true);
create policy "user_geo_rank_public_read"     on public.user_geo_rank      for select using (true);
create policy "venue_photos_public_read"      on public.venue_photos       for select using (true);
create policy "confirmations_read"            on public.report_confirmations for select using (true);

-- Users — own profile only
create policy "users_own_read"   on public.users for select using (auth.uid() = id);
create policy "users_own_update" on public.users for update using (auth.uid() = id);

-- Wait reports — authenticated insert
create policy "wait_reports_auth_insert" on public.wait_reports for insert with check (auth.uid() = user_id);

-- Favorites — own rows only
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id);

-- Notifications — own only
create policy "notifications_own" on public.notifications for select using (auth.uid() = user_id);

-- Points ledger — own only
create policy "ledger_own" on public.skip_points_ledger for select using (auth.uid() = user_id);

-- User rewards — own only
create policy "user_rewards_own" on public.user_rewards for select using (auth.uid() = user_id);

-- Quest progress — own only
create policy "quest_progress_own" on public.user_quest_progress for select using (auth.uid() = user_id);

-- Friendships — own only
create policy "friendships_own" on public.friendships for all using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Report confirmations — authenticated insert
create policy "confirmations_auth" on public.report_confirmations for insert with check (auth.uid() = user_id);
