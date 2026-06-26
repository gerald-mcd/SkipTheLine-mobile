/**
 * SkipTheLine — Patch Script: Reviews + Hours
 * Fetches real Google reviews and structured hours for all
 * venues already in the database. Does NOT re-seed venues.
 *
 * Run: node scripts/patch-reviews-hours.js
 */

const fs   = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const env = {}
  for (const file of ['.env', '.env.local']) {
    const fp = path.join(process.cwd(), file)
    if (!fs.existsSync(fp)) continue
    for (const line of fs.readFileSync(fp, 'utf-8').split('\n')) {
      const idx = line.indexOf('=')
      if (idx > 0) {
        const key = line.slice(0, idx).trim()
        const val = line.slice(idx + 1).trim()
        if (key) env[key] = val
      }
    }
  }
  return env
}

const ENV          = loadEnv()
const SUPABASE_URL = 'https://bcwlzzuevmtvlahxxdqb.supabase.co'
const SERVICE_KEY  = ENV['SUPABASE_SERVICE_ROLE_KEY'] || ''
const GOOGLE_KEY   = ENV['EXPO_PUBLIC_GOOGLE_MAPS_KEY'] || ''
const PLACES_BASE  = 'https://places.googleapis.com/v1'

console.log('Google key:', GOOGLE_KEY ? GOOGLE_KEY.slice(0, 15) + '...' : 'MISSING')
console.log('Supabase key:', SERVICE_KEY ? SERVICE_KEY.slice(0, 15) + '...' : 'MISSING')

if (!SERVICE_KEY) { console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
if (!GOOGLE_KEY)  { console.error('❌ Missing EXPO_PUBLIC_GOOGLE_MAPS_KEY'); process.exit(1) }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Fetch place details (reviews + hours only) ────────────────────────────────

async function fetchPlaceDetails(googlePlaceId) {
  const fieldMask = 'id,reviews,regularOpeningHours'
  const res = await fetch(`${PLACES_BASE}/places/${googlePlaceId}`, {
    headers: {
      'X-Goog-Api-Key':   GOOGLE_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}

// ─── Save reviews ──────────────────────────────────────────────────────────────

async function saveReviews(venueId, reviews) {
  if (!reviews || reviews.length === 0) return 0
  let saved = 0
  for (const review of reviews) {
    if (!review.text?.text) continue
    const { error } = await sb.from('venue_reviews').upsert({
      venue_id:    venueId,
      source:      'google',
      stars:       review.rating ?? 0,
      text:        review.text.text,
      author_name: review.authorAttribution?.displayName ?? 'Anonymous',
      created_at:  review.publishTime ?? new Date().toISOString(),
    }, { onConflict: 'venue_id,source,author_name' })
    if (!error) saved++
  }
  return saved
}

// ─── Save structured hours ─────────────────────────────────────────────────────

async function saveHours(venueId, regularOpeningHours) {
  if (!regularOpeningHours?.periods) return 0
  let saved = 0
  for (const period of regularOpeningHours.periods) {
    const open  = period.open
    const close = period.close
    if (!open) continue

    const dayOfWeek = open.day
    const openTime  = open.hour  != null ? `${String(open.hour).padStart(2,'0')}:${String(open.minute ?? 0).padStart(2,'0')}` : null
    const closeTime = close?.hour != null ? `${String(close.hour).padStart(2,'0')}:${String(close.minute ?? 0).padStart(2,'0')}` : null
    const is24h     = openTime === '00:00' && closeTime === '00:00'

    const { error } = await sb.from('venue_hours').upsert({
      venue_id:    venueId,
      day_of_week: dayOfWeek,
      open_time:   is24h ? null : openTime,
      close_time:  is24h ? null : closeTime,
      is_closed:   false,
      is_24h:      is24h,
    }, { onConflict: 'venue_id,day_of_week' })
    if (!error) saved++
  }
  return saved
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍  Fetching venues from Supabase...')

  // Test mode: pass --test to only process 2 venues
  const isTest = process.argv.includes('--test')
  const query  = sb
    .from('venues')
    .select('id, name, google_place_id')
    .not('google_place_id', 'is', null)
    .order('name')

  if (isTest) query.limit(2)

  const { data: venues, error } = await query

  if (error) { console.error('❌ Supabase error:', error.message); process.exit(1) }

  console.log(`✅  Found ${venues.length} venues to patch\n`)

  let reviewsAdded = 0
  let hoursAdded   = 0
  let errors       = 0
  let processed    = 0

  for (const venue of venues) {
    processed++
    process.stdout.write(`\r   [${processed}/${venues.length}] ${venue.name.slice(0, 40).padEnd(40)} `)

    try {
      const details = await fetchPlaceDetails(venue.google_place_id)

      const r = await saveReviews(venue.id, details.reviews)
      const h = await saveHours(venue.id, details.regularOpeningHours)

      reviewsAdded += r
      hoursAdded   += h

      await sleep(60) // gentle rate limiting — ~16 requests/sec
    } catch (err) {
      errors++
      // Don't stop on individual errors — log and continue
      process.stdout.write(`❌\n`)
      console.error(`   Error on ${venue.name}: ${err.message}`)
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Patch complete`)
  console.log(`    Reviews added:    ${reviewsAdded}`)
  console.log(`    Hours added:      ${hoursAdded}`)
  console.log(`    Venues processed: ${processed}`)
  console.log(`    Errors:           ${errors}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1) })
