/**
 * SkipTheLine — Seed Script
 *
 * Creates realistic test data for dev/demo use.
 * Run:  npx ts-node scripts/seed.ts
 * Wipe: npx ts-node scripts/seed.ts --wipe
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://bcwlzzuevmtvlahxxdqb.supabase.co'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY in environment')
  console.error('    Set it in your shell: export SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const WIPE_ONLY = process.argv.includes('--wipe')

// ─── Test users ───────────────────────────────────────────────────────────────

const TEST_USERS = [
  { email: 'gerald@skiptheline.site',  name: 'Gerald McDonald',  handle: '@gerald',  points: 2840, streak: 12, rank: 47  },
  { email: 'jason@skiptheline.site',   name: 'Jason Mizrachi',   handle: '@jason',   points: 1250, streak: 5,  rank: 112 },
  { email: 'test@skiptheline.site',    name: 'Test User',        handle: '@testuser',points: 340,  streak: 3,  rank: 389 },
]

// ─── Miami venues (realistic coordinates) ────────────────────────────────────

const VENUES = [
  { name: 'Komodo',               category: 'restaurants',   lat: 25.7617, lng: -80.1918, address: '801 Brickell Plaza',      typical_wait: 45, hours: '5pm – 2am',  vibe: 'Pan-Asian · Buzzy',      price_range: '$$$' },
  { name: 'Sugar Rooftop',        category: 'entertainment', lat: 25.7640, lng: -80.1890, address: '788 Brickell Plaza',      typical_wait: 55, hours: '5pm – 2am',  vibe: 'Skyline · Asian Garden', price_range: '$$$' },
  { name: 'Brickell Barber Shop', category: 'barbershops',   lat: 25.7590, lng: -80.1930, address: '1450 Brickell Ave',       typical_wait: 15, hours: '9am – 8pm',  vibe: 'Classic cuts',           price_range: '$$'  },
  { name: 'Whole Foods Brickell', category: 'grocery',       lat: 25.7605, lng: -80.1905, address: '299 SE 3rd St',           typical_wait: 10, hours: '7am – 10pm', vibe: 'Self-checkout open',     price_range: '$$'  },
  { name: 'La Mar',               category: 'restaurants',   lat: 25.7625, lng: -80.1870, address: '500 Brickell Key Dr',     typical_wait: 35, hours: '12pm – 11pm',vibe: 'Waterfront · Ceviche',   price_range: '$$$' },
  { name: 'Pura Vida',            category: 'restaurants',   lat: 25.7598, lng: -80.1912, address: '1000 Brickell Ave',       typical_wait: 8,  hours: '7am – 10pm', vibe: 'Açaí · Smoothies',       price_range: '$$'  },
  { name: 'Brickell City Centre', category: 'retail',        lat: 25.7648, lng: -80.1930, address: '701 S Miami Ave',         typical_wait: 18, hours: '10am – 9pm', vibe: 'Upscale shopping',       price_range: '$$$' },
  { name: 'Brickell Key Park',    category: 'landmarks',     lat: 25.7635, lng: -80.1830, address: 'Brickell Key Dr',         typical_wait: 0,  hours: 'Always open', vibe: 'Waterfront walk',        price_range: '$'   },
  { name: 'Vice City Bean',       category: 'restaurants',   lat: 25.7610, lng: -80.1925, address: '88 SW 7th St',            typical_wait: 10, hours: '6am – 6pm',  vibe: 'Local roast · Laptops',  price_range: '$'   },
  { name: 'LIV Nightclub',        category: 'entertainment', lat: 25.7916, lng: -80.1302, address: '4441 Collins Ave',        typical_wait: 65, hours: '11pm – 5am', vibe: 'Nightlife · VIP',        price_range: '$$$$'},
  { name: 'Story Nightclub',      category: 'entertainment', lat: 25.7901, lng: -80.1298, address: '136 Collins Ave',         typical_wait: 50, hours: '11pm – 5am', vibe: 'EDM · Rooftop',          price_range: '$$$$'},
  { name: 'Zuma Miami',           category: 'restaurants',   lat: 25.7677, lng: -80.1887, address: '270 Biscayne Blvd Way',   typical_wait: 40, hours: '12pm – 1am', vibe: 'Japanese · Izakaya',     price_range: '$$$$'},
  { name: 'Trulucks Brickell',    category: 'restaurants',   lat: 25.7622, lng: -80.1940, address: '777 Brickell Ave',        typical_wait: 30, hours: '4pm – 11pm', vibe: 'Seafood · Upscale',      price_range: '$$$$'},
  { name: 'DMV Brickell',         category: 'government',    lat: 25.7580, lng: -80.1980, address: '2900 NW 7th Ave',         typical_wait: 90, hours: '8am – 5pm',  vibe: 'Bring snacks',           price_range: '$'   },
  { name: 'Wynwood Walls',        category: 'attractions',   lat: 25.8004, lng: -80.1996, address: '2516 NW 2nd Ave',         typical_wait: 20, hours: '10am – 8pm', vibe: 'Street art · Iconic',    price_range: '$'   },
]

// ─── Report types ─────────────────────────────────────────────────────────────

const REPORT_TYPES = ['walk-in', 'reservation', 'vip', 'guest_list', 'counter']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function minsAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

// ─── Wipe ─────────────────────────────────────────────────────────────────────

async function wipe() {
  console.log('🧹  Wiping test data...')

  // Get test user IDs
  const { data: testUsers } = await sb.from('users').select('id').eq('is_test_user', true)
  const testIds = (testUsers ?? []).map(u => u.id)

  if (testIds.length === 0) {
    console.log('   No test users found — nothing to wipe')
    return
  }

  // Delete all activity linked to test users
  await sb.from('points_ledger').delete().in('user_id', testIds)
  await sb.from('user_badges').delete().in('user_id', testIds)
  await sb.from('user_quest_progress').delete().in('user_id', testIds)
  await sb.from('reward_redemptions').delete().in('user_id', testIds)
  await sb.from('favorites').delete().in('user_id', testIds)
  await sb.from('friendships').delete().in('requester_id', testIds)
  await sb.from('friendships').delete().in('addressee_id', testIds)
  await sb.from('activity_history').delete().in('user_id', testIds)
  await sb.from('arrival_nudge_log').delete().in('user_id', testIds)
  await sb.from('wait_drop_alerts').delete().in('user_id', testIds)
  await sb.from('notification_log').delete().in('user_id', testIds)
  await sb.from('voice_sessions').delete().in('user_id', testIds)

  // Delete reports from test users (this also cleans wait cache via triggers)
  const { data: testReports } = await sb.from('reports').select('id').in('user_id', testIds)
  const reportIds = (testReports ?? []).map(r => r.id)
  if (reportIds.length > 0) {
    await sb.from('report_confirmations').delete().in('report_id', reportIds)
    await sb.from('reports').delete().in('user_id', testIds)
  }

  // Delete test venues (seeded venues only — identified by source)
  await sb.from('wait_time_cache').delete().neq('venue_id', '00000000-0000-0000-0000-000000000000')
  const { data: seedVenues } = await sb.from('venues').select('id').eq('source', 'seed')
  const venueIds = (seedVenues ?? []).map(v => v.id)
  if (venueIds.length > 0) {
    await sb.from('venue_photos').delete().in('venue_id', venueIds)
    await sb.from('venues').delete().in('id', venueIds)
  }

  console.log('✅  Test data wiped')
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Seeding test data...')

  // ── 1. Create / update test user profiles ──────────────────────────────────
  console.log('   Creating test users...')
  const userIds: Record<string, string> = {}

  for (const u of TEST_USERS) {
    // Upsert auth user
    const { data: authData } = await sb.auth.admin.listUsers()
    let authUser = authData?.users.find(au => au.email === u.email)

    if (!authUser) {
      const { data: created } = await sb.auth.admin.createUser({
        email: u.email,
        password: 'SkipTest2024!',
        email_confirm: true,
      })
      authUser = created.user ?? undefined
    }

    if (!authUser) { console.error(`   ❌ Could not create auth user ${u.email}`); continue }

    // Upsert profile row
    const { data: profile, error } = await sb.from('users').upsert({
      auth_id:          authUser.id,
      email:            u.email,
      name:             u.name,
      handle:           u.handle,
      points:           u.points,
      streak:           u.streak,
      streak_last_date: new Date().toISOString().split('T')[0],
      rank:             u.rank,
      rank_trend:       'up',
      rank_delta:       5,
      reports_count:    rand(20, 150),
      reports_this_week:rand(3, 25),
      trust_score:      100,
      is_test_user:     true,
      city:             'Miami',
      neighborhood:     'Brickell',
      joined_at:        minsAgo(rand(1440, 43200)),
      onboarding_completed: true,
      onboarding_tour_completed: true,
      first_login_at:   minsAgo(rand(1440, 43200)),
      terms_accepted_at: minsAgo(rand(1440, 43200)),
      terms_version:    '1.0',
    }, { onConflict: 'auth_id' }).select('id').single()

    if (error) { console.error(`   ❌ Profile error for ${u.email}:`, error.message); continue }
    userIds[u.email] = profile!.id
    console.log(`   ✅ ${u.name} (${u.email})`)
  }

  const allUserIds = Object.values(userIds)
  if (allUserIds.length === 0) { console.error('❌ No users created — aborting'); return }

  // ── 2. Seed venues ─────────────────────────────────────────────────────────
  console.log('   Seeding venues...')
  const venueIds: string[] = []

  for (const v of VENUES) {
    const waitNow = rand(Math.max(0, v.typical_wait - 20), v.typical_wait + 20)
    const { data: venue, error } = await sb.from('venues').upsert({
      name:                 v.name,
      category:             v.category,
      category_label:       v.category.charAt(0).toUpperCase() + v.category.slice(1),
      lat:                  v.lat,
      lng:                  v.lng,
      address:              v.address,
      city:                 'Miami',
      neighborhood:         'Brickell',
      hours:                v.hours,
      vibe:                 v.vibe,
      price_range:          v.price_range,
      typical_wait_minutes: v.typical_wait,
      current_wait_minutes: waitNow,
      trend:                waitNow > v.typical_wait ? 'up' : waitNow < v.typical_wait ? 'down' : 'flat',
      severity:             waitNow <= 15 ? 'short' : waitNow <= 45 ? 'moderate' : 'long',
      average_rating:       parseFloat((rand(38, 49) / 10).toFixed(1)),
      live_reporters:       rand(1, 8),
      reports_count:        rand(5, 35),
      last_report_at:       minsAgo(rand(1, 20)),
      is_active:            true,
      source:               'seed',
    }, { onConflict: 'name' }).select('id').single()

    if (error) { console.error(`   ❌ Venue error ${v.name}:`, error.message); continue }
    venueIds.push(venue!.id)
  }
  console.log(`   ✅ ${venueIds.length} venues seeded`)

  // ── 3. Seed reports ────────────────────────────────────────────────────────
  console.log('   Seeding reports...')
  let reportCount = 0

  for (const venueId of venueIds) {
    const numReports = rand(3, 8)
    for (let i = 0; i < numReports; i++) {
      const userId = randItem(allUserIds)
      const waitMin = rand(0, 90)
      const { error } = await sb.from('reports').insert({
        venue_id:       venueId,
        user_id:        userId,
        wait_minutes:   waitMin,
        report_type:    randItem(REPORT_TYPES),
        location_verified: Math.random() > 0.3,
        anomaly_score:  rand(0, 15),
        flagged:        false,
        weight:         1.0,
        points_awarded: 10,
        platform:       randItem(['ios', 'android']),
        created_at:     minsAgo(rand(1, 120)),
      })
      if (!error) reportCount++
    }
  }
  console.log(`   ✅ ${reportCount} reports seeded`)

  // ── 4. Seed wait time cache ────────────────────────────────────────────────
  console.log('   Updating wait cache...')
  for (let i = 0; i < venueIds.length; i++) {
    const v = VENUES[i]
    if (!v) continue
    const waitNow = rand(Math.max(0, v.typical_wait - 15), v.typical_wait + 15)
    await sb.from('wait_time_cache').upsert({
      venue_id:             venueIds[i],
      computed_wait:        waitNow,
      report_count:         rand(3, 8),
      trusted_report_count: rand(2, 6),
      has_live_data:        true,
      computation_method:   'crowd',
      confidence:           parseFloat((rand(70, 95) / 100).toFixed(2)),
      last_computed_at:     minsAgo(rand(1, 10)),
    }, { onConflict: 'venue_id' })
  }
  console.log('   ✅ Wait cache updated')

  // ── 5. Seed points ledger ──────────────────────────────────────────────────
  console.log('   Seeding points ledger...')
  for (const [email, userId] of Object.entries(userIds)) {
    const user = TEST_USERS.find(u => u.email === email)!
    const entries = rand(10, 30)
    let balance = 0
    for (let i = 0; i < entries; i++) {
      const amount = randItem([10, 10, 10, 15, 25, 50, 75])
      balance += amount
      await sb.from('points_ledger').insert({
        user_id:     userId,
        amount,
        type:        randItem(['report', 'confirmation', 'quest', 'streak_bonus']),
        description: 'Test seed entry',
        balance,
        created_at:  minsAgo(rand(1, 43200)),
      })
    }
  }
  console.log('   ✅ Points ledger seeded')

  // ── 6. Seed badges ─────────────────────────────────────────────────────────
  console.log('   Seeding badges...')
  const { data: badges } = await sb.from('badge_definitions').select('id').limit(4)
  for (const userId of allUserIds) {
    for (const badge of (badges ?? []).slice(0, rand(1, 3))) {
      await sb.from('user_badges').upsert({
        user_id:   userId,
        badge_id:  badge.id,
        earned_at: minsAgo(rand(60, 10080)),
      }, { onConflict: 'user_id,badge_id' })
    }
  }
  console.log('   ✅ Badges seeded')

  // ── 7. Seed quest progress ─────────────────────────────────────────────────
  console.log('   Seeding quest progress...')
  const { data: quests } = await sb.from('quest_definitions').select('id, goal').limit(4)
  const today = new Date().toISOString().split('T')[0]
  for (const userId of allUserIds) {
    for (const quest of (quests ?? [])) {
      const progress = rand(0, quest.goal)
      await sb.from('user_quest_progress').upsert({
        user_id:      userId,
        quest_id:     quest.id,
        progress,
        completed:    progress >= quest.goal,
        completed_at: progress >= quest.goal ? minsAgo(rand(10, 120)) : null,
        period_start: today,
      }, { onConflict: 'user_id,quest_id,period_start' })
    }
  }
  console.log('   ✅ Quest progress seeded')

  // ── 8. Seed friendships ────────────────────────────────────────────────────
  if (allUserIds.length >= 2) {
    console.log('   Seeding friendships...')
    await sb.from('friendships').upsert({
      requester_id: allUserIds[0],
      addressee_id: allUserIds[1],
      status:       'accepted',
    }, { onConflict: 'requester_id,addressee_id' })
    if (allUserIds.length >= 3) {
      await sb.from('friendships').upsert({
        requester_id: allUserIds[0],
        addressee_id: allUserIds[2],
        status:       'accepted',
      }, { onConflict: 'requester_id,addressee_id' })
    }
    console.log('   ✅ Friendships seeded')
  }

  // ── 9. Seed favorites ──────────────────────────────────────────────────────
  console.log('   Seeding favorites...')
  for (const userId of allUserIds) {
    const favVenues = venueIds.slice(0, rand(2, 5))
    for (const venueId of favVenues) {
      await sb.from('favorites').upsert({
        user_id:  userId,
        venue_id: venueId,
      }, { onConflict: 'user_id,venue_id' })
    }
  }
  console.log('   ✅ Favorites seeded')

  console.log('\n🎉  Seed complete!')
  console.log('   Test accounts:')
  for (const u of TEST_USERS) {
    console.log(`   → ${u.email}  /  SkipTest2024!`)
  }
  console.log('\n   Run with --wipe to clear all test data')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (WIPE_ONLY) {
    await wipe()
  } else {
    await wipe()   // always wipe first for clean state
    await seed()
  }
  process.exit(0)
}

main().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
