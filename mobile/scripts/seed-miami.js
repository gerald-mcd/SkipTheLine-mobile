/**
 * SkipTheLine — Miami Venue Seeding Script
 * Uses Google Places API (New) — v1/places:searchNearby
 * Run: node scripts/seed-miami.js
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

console.log('Google key:', GOOGLE_KEY ? GOOGLE_KEY.slice(0, 15) + '...' : 'MISSING')
console.log('Supabase key:', SERVICE_KEY ? SERVICE_KEY.slice(0, 15) + '...' : 'MISSING')

if (!SERVICE_KEY) { console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
if (!GOOGLE_KEY)  { console.error('❌ Missing EXPO_PUBLIC_GOOGLE_MAPS_KEY'); process.exit(1) }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Places API (New) base URL ────────────────────────────────────────────────

const PLACES_BASE = 'https://places.googleapis.com/v1'

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

// ─── Place types for Places API (New) ────────────────────────────────────────

const SEARCH_TYPES = [
  { type: 'restaurant',              category: 'restaurants',   label: 'Restaurant' },
  { type: 'cafe',                    category: 'restaurants',   label: 'Café' },
  { type: 'bar',                     category: 'entertainment', label: 'Bar' },
  { type: 'night_club',              category: 'entertainment', label: 'Nightclub' },
  { type: 'hair_salon',              category: 'barbershops',   label: 'Barbershop' },
  { type: 'grocery_store',           category: 'grocery',       label: 'Grocery' },
  { type: 'supermarket',             category: 'grocery',       label: 'Grocery' },
  { type: 'city_hall',               category: 'government',    label: 'Government' },
  { type: 'local_government_office', category: 'government',    label: 'Government' },
  { type: 'hospital',                category: 'healthcare',    label: 'Healthcare' },
  { type: 'pharmacy',                category: 'healthcare',    label: 'Pharmacy' },
  { type: 'shopping_mall',           category: 'retail',        label: 'Mall' },
  { type: 'tourist_attraction',      category: 'attractions',   label: 'Attraction' },
  { type: 'museum',                  category: 'landmarks',     label: 'Museum' },
  { type: 'park',                    category: 'landmarks',     label: 'Park' },
]

// ─── Map Places API (New) types → our categories ──────────────────────────────

function mapCategory(types = []) {
  if (types.some(t => ['night_club', 'bar', 'cocktail_bar', 'wine_bar'].includes(t)))
    return { category: 'entertainment', label: 'Bar / Nightclub' }
  if (types.some(t => ['restaurant', 'food', 'cafe', 'bakery', 'meal_takeaway', 'fast_food_restaurant', 'coffee_shop'].includes(t)))
    return { category: 'restaurants', label: 'Restaurant' }
  if (types.some(t => ['hair_salon', 'barber_shop', 'beauty_salon'].includes(t)))
    return { category: 'barbershops', label: 'Barbershop' }
  if (types.some(t => ['grocery_store', 'supermarket', 'convenience_store'].includes(t)))
    return { category: 'grocery', label: 'Grocery' }
  if (types.some(t => ['city_hall', 'local_government_office', 'courthouse', 'post_office'].includes(t)))
    return { category: 'government', label: 'Government Office' }
  if (types.some(t => ['hospital', 'doctor', 'pharmacy', 'medical_lab', 'health'].includes(t)))
    return { category: 'healthcare', label: 'Healthcare' }
  if (types.some(t => ['shopping_mall', 'clothing_store', 'shoe_store', 'department_store'].includes(t)))
    return { category: 'retail', label: 'Retail' }
  if (types.some(t => ['museum', 'art_gallery', 'library', 'cultural_landmark'].includes(t)))
    return { category: 'landmarks', label: 'Landmark' }
  if (types.some(t => ['amusement_park', 'zoo', 'aquarium', 'stadium', 'tourist_attraction'].includes(t)))
    return { category: 'attractions', label: 'Attraction' }
  if (types.some(t => ['park', 'national_park', 'campground', 'natural_feature'].includes(t)))
    return { category: 'landmarks', label: 'Park' }
  return { category: 'restaurants', label: 'Venue' }
}

function mapPriceRange(level) {
  return ['$', '$', '$$', '$$$', '$$$$'][level] || '$$'
}

// ─── Build photo URL using Places API (New) format ────────────────────────────

function buildPhotoUrl(photoName) {
  // photoName is like: places/ChIJ.../photos/AUjq9jk...
  return `${PLACES_BASE}/${photoName}/media?maxWidthPx=800&key=${GOOGLE_KEY}`
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Places API (New) — Nearby Search ────────────────────────────────────────

async function nearbySearch(lat, lng, radius, includedType, pageToken) {
  const body = {
    includedTypes: [includedType],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: parseFloat(radius),
      },
    },
    ...(pageToken ? { pageToken } : {}),
  }

  // Fields to return — only request what we need to minimize billing
  const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri'

  const res = await fetch(`${PLACES_BASE}/places:searchNearby`, {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  GOOGLE_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (data.error) {
    throw new Error(`Google API error: ${data.error.message}`)
  }

  return {
    places:        data.places || [],
    nextPageToken: data.nextPageToken || null,
  }
}

// ─── Transform Places API (New) result → our venue shape ─────────────────────

function transformVenue(place, neighborhood, isLaunched) {
  const types    = place.types || []
  const { category, label } = mapCategory(types)
  const photoName = place.photos?.[0]?.name || null
  const hours     = place.regularOpeningHours?.weekdayDescriptions?.join(' | ') || null

  return {
    google_place_id:      place.id,
    name:                 place.displayName?.text || place.displayName || '',
    category,
    category_label:       label,
    lat:                  place.location?.latitude  || 0,
    lng:                  place.location?.longitude || 0,
    address:              place.formattedAddress || '',
    city:                 'Miami',
    neighborhood,
    hours,
    phone:                place.nationalPhoneNumber || null,
    website:              place.websiteUri || null,
    google_rating:        place.rating || null,
    google_rating_count:  place.userRatingCount || null,
    average_rating:       place.rating || 0,
    price_range:          mapPriceRange(place.priceLevel),
    google_photo_ref:     photoName,
    primary_image_url:    photoName ? buildPhotoUrl(photoName) : null,
    source:               'google',
    is_active:            true,
    is_launched:          isLaunched,
    is_claimed:           false,
    is_verified:          false,
    current_wait_minutes: 0,
    typical_wait_minutes: 0,
    live_reporters:       0,
    reports_count:        0,
    trend:                'flat',
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌴  Starting Miami venue seeding (Places API New)...\n')

  const seen = new Set()
  let inserted = 0, skipped = 0, errors = 0

  for (const section of MIAMI_GRID) {
    console.log(`\n📍  ${section.name} (${section.is_launched ? 'LIVE' : 'seeded, not launched'})`)

    for (const cat of SEARCH_TYPES) {
      process.stdout.write(`   ${cat.label}... `)
      let pageToken = null
      let pageCount = 0

      do {
        try {
          if (pageToken) await sleep(500)

          const { places, nextPageToken } = await nearbySearch(
            section.lat, section.lng, section.radius, cat.type, pageToken
          )
          pageToken  = nextPageToken
          pageCount++

          for (const place of places) {
            if (!place.id) continue
            if (seen.has(place.id)) { skipped++; continue }
            seen.add(place.id)

            if (!place.displayName?.text && !place.displayName) { errors++; continue }

            const venue = transformVenue(place, section.name, section.is_launched)

            const { error } = await sb.from('venues').upsert(venue, {
              onConflict: 'google_place_id',
            })

            if (error) {
              errors++
              console.error(`\n   ❌ ${venue.name}: ${error.message}`)
            } else {
              inserted++
            }

            await sleep(30) // gentle rate limiting
          }

        } catch (err) {
          console.error(`\n   ❌ ${err.message}`)
          errors++
          break
        }

      } while (pageToken && pageCount < 3) // max 3 pages per type per section

      console.log(`✅  (${inserted} total)`)
      await sleep(100)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Done`)
  console.log(`    Venues inserted: ${inserted}`)
  console.log(`    Duplicates skipped: ${skipped}`)
  console.log(`    Errors: ${errors}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1) })
