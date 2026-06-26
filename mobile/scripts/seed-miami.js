/**
 * SkipTheLine — Miami Venue Seeding Script (Plain JS)
 * Run: node scripts/seed-miami.js
 */

const fs   = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// ─── Load env files ───────────────────────────────────────────────────────────

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

const ENV         = loadEnv()
const SUPABASE_URL = 'https://bcwlzzuevmtvlahxxdqb.supabase.co'
const SERVICE_KEY  = ENV['SUPABASE_SERVICE_ROLE_KEY'] || ''
const GOOGLE_KEY   = ENV['EXPO_PUBLIC_GOOGLE_MAPS_KEY'] || ''

console.log('Google key loaded:', GOOGLE_KEY ? GOOGLE_KEY.slice(0,15)+'...' : 'MISSING')
console.log('Supabase key loaded:', SERVICE_KEY ? SERVICE_KEY.slice(0,15)+'...' : 'MISSING')

if (!SERVICE_KEY) { console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
if (!GOOGLE_KEY)  { console.error('❌ Missing EXPO_PUBLIC_GOOGLE_MAPS_KEY'); process.exit(1) }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Miami grid ───────────────────────────────────────────────────────────────

const MIAMI_GRID = [
  { name: 'Brickell',        lat: 25.7617, lng: -80.1918, radius: 1500, is_launched: true  },
  { name: 'Downtown Miami',  lat: 25.7751, lng: -80.1947, radius: 1500, is_launched: false },
  { name: 'Wynwood',         lat: 25.8004, lng: -80.1996, radius: 1000, is_launched: false },
  { name: 'South Beach',     lat: 25.7825, lng: -80.1300, radius: 2000, is_launched: false },
  { name: 'Midtown',         lat: 25.8060, lng: -80.1920, radius: 1000, is_launched: false },
  { name: 'Coral Gables',    lat: 25.7215, lng: -80.2684, radius: 2000, is_launched: false },
  { name: 'Coconut Grove',   lat: 25.7280, lng: -80.2380, radius: 1500, is_launched: false },
  { name: 'Little Havana',   lat: 25.7720, lng: -80.2310, radius: 1500, is_launched: false },
  { name: 'Design District', lat: 25.8130, lng: -80.1940, radius: 1000, is_launched: false },
  { name: 'Edgewater',       lat: 25.7980, lng: -80.1870, radius: 1000, is_launched: false },
]

const CATEGORIES = [
  { googleType: 'restaurant',              ourCategory: 'restaurants',   label: 'Restaurant' },
  { googleType: 'cafe',                    ourCategory: 'restaurants',   label: 'Café' },
  { googleType: 'bar',                     ourCategory: 'entertainment', label: 'Bar' },
  { googleType: 'night_club',              ourCategory: 'entertainment', label: 'Nightclub' },
  { googleType: 'hair_care',               ourCategory: 'barbershops',   label: 'Barbershop' },
  { googleType: 'grocery_or_supermarket',  ourCategory: 'grocery',       label: 'Grocery' },
  { googleType: 'local_government_office', ourCategory: 'government',    label: 'Government' },
  { googleType: 'hospital',                ourCategory: 'healthcare',    label: 'Healthcare' },
  { googleType: 'shopping_mall',           ourCategory: 'retail',        label: 'Mall' },
  { googleType: 'tourist_attraction',      ourCategory: 'attractions',   label: 'Attraction' },
  { googleType: 'museum',                  ourCategory: 'landmarks',     label: 'Museum' },
  { googleType: 'park',                    ourCategory: 'landmarks',     label: 'Park' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapCategory(types = []) {
  if (types.some(t => ['night_club', 'bar'].includes(t)))                         return { category: 'entertainment', label: 'Bar / Nightclub' }
  if (types.some(t => ['restaurant', 'food', 'cafe', 'bakery'].includes(t)))      return { category: 'restaurants',   label: 'Restaurant' }
  if (types.some(t => ['hair_care', 'beauty_salon'].includes(t)))                 return { category: 'barbershops',   label: 'Barbershop' }
  if (types.some(t => ['grocery_or_supermarket', 'supermarket'].includes(t)))     return { category: 'grocery',       label: 'Grocery' }
  if (types.some(t => ['local_government_office', 'city_hall'].includes(t)))      return { category: 'government',    label: 'Government Office' }
  if (types.some(t => ['hospital', 'doctor', 'pharmacy'].includes(t)))            return { category: 'healthcare',    label: 'Healthcare' }
  if (types.some(t => ['shopping_mall', 'store', 'clothing_store'].includes(t)))  return { category: 'retail',        label: 'Retail' }
  if (types.some(t => ['museum', 'art_gallery', 'library'].includes(t)))          return { category: 'landmarks',     label: 'Landmark' }
  if (types.some(t => ['amusement_park', 'zoo', 'aquarium'].includes(t)))         return { category: 'attractions',   label: 'Attraction' }
  if (types.some(t => ['tourist_attraction', 'park'].includes(t)))                return { category: 'landmarks',     label: 'Landmark' }
  return { category: 'restaurants', label: 'Venue' }
}

function mapPriceRange(level) {
  return ['$', '$', '$$', '$$$', '$$$$'][level] || '$$'
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Google API calls ─────────────────────────────────────────────────────────

async function nearbySearch(lat, lng, radius, type, pageToken) {
  const params = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radius), type, key: GOOGLE_KEY })
  if (pageToken) params.set('pagetoken', pageToken)
  const res  = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`)
  const data = await res.json()
  if (data.status === 'REQUEST_DENIED') throw new Error(`Google denied: ${data.error_message}`)
  return { places: data.results || [], nextPageToken: data.next_page_token }
}

async function placeDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields:   'place_id,name,formatted_address,geometry,types,opening_hours,formatted_phone_number,website,rating,user_ratings_total,price_level,photos',
    key:      GOOGLE_KEY,
  })
  const res  = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`)
  const data = await res.json()
  if (data.status !== 'OK') return null
  return data.result || null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌴  Starting Miami venue seeding...\n')

  const seen = new Set()
  let inserted = 0, skipped = 0, errors = 0

  for (const section of MIAMI_GRID) {
    console.log(`\n📍  ${section.name} (${section.is_launched ? 'LIVE' : 'seeded, not launched'})`)

    for (const cat of CATEGORIES) {
      process.stdout.write(`   ${cat.label}... `)
      let pageToken

      do {
        try {
          if (pageToken) await sleep(2000)
          const { places, nextPageToken } = await nearbySearch(section.lat, section.lng, section.radius, cat.googleType, pageToken)
          pageToken = nextPageToken

          for (const place of places) {
            if (seen.has(place.place_id)) { skipped++; continue }
            seen.add(place.place_id)

            await sleep(80)
            const detail = await placeDetails(place.place_id)

            // Use detail if available, else fall back to nearby data
            const src = detail || {
              place_id:               place.place_id,
              name:                   place.name,
              formatted_address:      place.vicinity || '',
              geometry:               place.geometry,
              types:                  place.types || [],
              rating:                 place.rating || null,
              user_ratings_total:     place.user_ratings_total || null,
              price_level:            place.price_level || null,
              photos:                 place.photos || [],
              opening_hours:          null,
              formatted_phone_number: null,
              website:                null,
            }

            if (!src.name) { errors++; continue }

            const { category, label } = mapCategory(src.types)
            const photoRef = src.photos?.[0]?.photo_reference || null

            const venue = {
              google_place_id:      src.place_id,
              name:                 src.name,
              category,
              category_label:       label,
              lat:                  src.geometry?.location?.lat || 0,
              lng:                  src.geometry?.location?.lng || 0,
              address:              src.formatted_address || '',
              city:                 'Miami',
              neighborhood:         section.name,
              hours:                src.opening_hours?.weekday_text?.join(' | ') || null,
              phone:                src.formatted_phone_number || null,
              website:              src.website || null,
              google_rating:        src.rating || null,
              google_rating_count:  src.user_ratings_total || null,
              average_rating:       src.rating || 0,
              price_range:          mapPriceRange(src.price_level),
              google_photo_ref:     photoRef,
              primary_image_url:    photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_KEY}` : null,
              source:               'google',
              is_active:            true,
              is_launched:          section.is_launched,
              is_claimed:           false,
              is_verified:          false,
              current_wait_minutes: 0,
              typical_wait_minutes: 0,
              live_reporters:       0,
              reports_count:        0,
              trend:                'flat',
            }

            const { error } = await sb.from('venues').upsert(venue, { onConflict: 'google_place_id' })
            if (error) { errors++; console.error(`\n   ❌ ${src.name}: ${error.message}`) }
            else inserted++
          }
        } catch (err) {
          console.error(`\n   ❌ API error: ${err.message}`)
          errors++
          break
        }
      } while (pageToken)

      console.log(`✅  (${inserted} total)`)
      await sleep(200)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Done — ${inserted} venues inserted, ${skipped} skipped, ${errors} errors`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1) })
