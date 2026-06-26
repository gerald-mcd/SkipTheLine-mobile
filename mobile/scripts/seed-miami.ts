/**
 * SkipTheLine — Miami Venue Seeding Script
 *
 * Pulls real Miami businesses from Google Places API
 * and inserts them into Supabase venues table.
 *
 * Run: npx ts-node scripts/seed-miami.ts
 *
 * Required env vars (in .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *   EXPO_PUBLIC_GOOGLE_MAPS_KEY=...  (already in .env)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://bcwlzzuevmtvlahxxdqb.supabase.co'

// Load env vars from .env and .env.local
function loadEnv() {
  const files = ['.env', '.env.local']
  const env: Record<string, string> = {}
  for (const file of files) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) continue
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
    for (const line of lines) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) env[key.trim()] = rest.join('=').trim()
    }
  }
  return env
}

const ENV = loadEnv()
const SERVICE_KEY  = ENV['SUPABASE_SERVICE_ROLE_KEY'] ?? ''
const GOOGLE_KEY   = ENV['EXPO_PUBLIC_GOOGLE_MAPS_KEY'] ?? ''

if (!SERVICE_KEY) { console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1) }
if (!GOOGLE_KEY)  { console.error('❌  Missing EXPO_PUBLIC_GOOGLE_MAPS_KEY in .env');      process.exit(1) }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Miami search grid ────────────────────────────────────────────────────────
// Covers: Brickell, Downtown, Wynwood, South Beach, Midtown, Coral Gables, Coconut Grove

// is_launched = true means this neighborhood is live in the app
// Change to false to seed but not show to users yet
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

// ─── Category search terms ────────────────────────────────────────────────────

const SEARCH_CATEGORIES = [
  { googleType: 'restaurant',               ourCategory: 'restaurants',   label: 'Restaurant' },
  { googleType: 'cafe',                     ourCategory: 'restaurants',   label: 'Café' },
  { googleType: 'bar',                      ourCategory: 'entertainment', label: 'Bar' },
  { googleType: 'night_club',               ourCategory: 'entertainment', label: 'Nightclub' },
  { googleType: 'hair_care',                ourCategory: 'barbershops',   label: 'Barbershop' },
  { googleType: 'grocery_or_supermarket',   ourCategory: 'grocery',       label: 'Grocery' },
  { googleType: 'local_government_office',  ourCategory: 'government',    label: 'Government' },
  { googleType: 'hospital',                 ourCategory: 'healthcare',    label: 'Healthcare' },
  { googleType: 'shopping_mall',            ourCategory: 'retail',        label: 'Mall' },
  { googleType: 'tourist_attraction',       ourCategory: 'attractions',   label: 'Attraction' },
  { googleType: 'museum',                   ourCategory: 'landmarks',     label: 'Museum' },
  { googleType: 'park',                     ourCategory: 'landmarks',     label: 'Park' },
]

// ─── Google type → our category ───────────────────────────────────────────────

function mapCategory(types: string[]): { category: string; label: string } {
  if (types.some(t => ['night_club', 'bar'].includes(t)))
    return { category: 'entertainment', label: 'Bar / Nightclub' }
  if (types.some(t => ['restaurant', 'food', 'cafe', 'bakery', 'meal_takeaway'].includes(t)))
    return { category: 'restaurants', label: 'Restaurant' }
  if (types.some(t => ['hair_care', 'beauty_salon'].includes(t)))
    return { category: 'barbershops', label: 'Barbershop' }
  if (types.some(t => ['grocery_or_supermarket', 'supermarket'].includes(t)))
    return { category: 'grocery', label: 'Grocery' }
  if (types.some(t => ['local_government_office', 'city_hall', 'courthouse'].includes(t)))
    return { category: 'government', label: 'Government Office' }
  if (types.some(t => ['hospital', 'doctor', 'pharmacy', 'health'].includes(t)))
    return { category: 'healthcare', label: 'Healthcare' }
  if (types.some(t => ['shopping_mall', 'store', 'clothing_store', 'shoe_store'].includes(t)))
    return { category: 'retail', label: 'Retail' }
  if (types.some(t => ['museum', 'art_gallery', 'library'].includes(t)))
    return { category: 'landmarks', label: 'Landmark' }
  if (types.some(t => ['amusement_park', 'zoo', 'aquarium', 'stadium'].includes(t)))
    return { category: 'attractions', label: 'Attraction' }
  if (types.some(t => ['tourist_attraction', 'park', 'natural_feature'].includes(t)))
    return { category: 'landmarks', label: 'Landmark' }
  return { category: 'restaurants', label: 'Venue' }
}

// ─── Price level → price range ────────────────────────────────────────────────

function mapPriceRange(level?: number): string {
  if (!level) return '$$'
  return ['$', '$', '$$', '$$$', '$$$$'][level] ?? '$$'
}

// ─── Build Google Photos URL ──────────────────────────────────────────────────

function buildPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${GOOGLE_KEY}`
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Google Places Nearby Search ─────────────────────────────────────────────

async function nearbySearch(
  lat: number,
  lng: number,
  radius: number,
  type: string,
  pageToken?: string
): Promise<{ places: any[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius:   String(radius),
    type,
    key:      GOOGLE_KEY,
    ...(pageToken ? { pagetoken: pageToken } : {}),
  })

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
  const res  = await fetch(url)
  const data = await res.json() as any

  if (data.status === 'REQUEST_DENIED') {
    throw new Error(`Google API denied: ${data.error_message}`)
  }

  return {
    places:        data.results ?? [],
    nextPageToken: data.next_page_token,
  }
}

// ─── Google Place Details ─────────────────────────────────────────────────────

async function placeDetails(placeId: string): Promise<any> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields:   'place_id,name,formatted_address,geometry,types,opening_hours,formatted_phone_number,website,rating,user_ratings_total,price_level,photos',
    key:      GOOGLE_KEY,
  })

  const url  = `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  const res  = await fetch(url)
  const data = await res.json() as any
  return data.result ?? null
}

// ─── Transform Google result → our venue shape ────────────────────────────────

function transformVenue(detail: any, neighborhood: string, isLaunched: boolean) {
  const { category, label } = mapCategory(detail.types ?? [])
  const photoRef = detail.photos?.[0]?.photo_reference ?? null

  return {
    google_place_id:      detail.place_id,
    name:                 detail.name,
    category,
    category_label:       label,
    lat:                  detail.geometry?.location?.lat ?? 0,
    lng:                  detail.geometry?.location?.lng ?? 0,
    address:              detail.formatted_address ?? '',
    city:                 'Miami',
    neighborhood,
    hours:                detail.opening_hours?.weekday_text?.join(' | ') ?? null,
    phone:                detail.formatted_phone_number ?? null,
    website:              detail.website ?? null,
    google_rating:        detail.rating ?? null,
    google_rating_count:  detail.user_ratings_total ?? null,
    average_rating:       detail.rating ?? 0,
    price_range:          mapPriceRange(detail.price_level),
    google_photo_ref:     photoRef,
    primary_image_url:    photoRef ? buildPhotoUrl(photoRef) : null,
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

// ─── Main seeding logic ───────────────────────────────────────────────────────

async function seedMiami() {
  console.log('🌴  Starting Miami venue seeding...')
  console.log(`    Grid sections: ${MIAMI_GRID.length}`)
  console.log(`    Categories:    ${SEARCH_CATEGORIES.length}`)
  console.log(`    Estimated venues: 1,500–3,500\n`)

  const seen   = new Set<string>() // track google_place_ids to avoid dupes
  let inserted = 0
  let skipped  = 0
  let errors   = 0

  for (const section of MIAMI_GRID) {
    console.log(`\n📍  ${section.name}`)

    for (const cat of SEARCH_CATEGORIES) {
      process.stdout.write(`   ${cat.label}... `)
      let pageToken: string | undefined

      do {
        try {
          // Respect Google's 2-second delay between paginated requests
          if (pageToken) await sleep(2000)

          const { places, nextPageToken } = await nearbySearch(
            section.lat, section.lng, section.radius, cat.googleType, pageToken
          )
          pageToken = nextPageToken

          for (const place of places) {
            if (seen.has(place.place_id)) { skipped++; continue }
            seen.add(place.place_id)

            // Get full details
            await sleep(100) // avoid rate limiting
            const detail = await placeDetails(place.place_id)
            if (!detail) { errors++; continue }

            const venue = transformVenue(detail, section.name, section.is_launched)

            // Upsert into Supabase
            const { error } = await sb.from('venues').upsert(venue, {
              onConflict: 'google_place_id',
            })

            if (error) {
              errors++
              console.error(`\n   ❌ ${detail.name}: ${error.message}`)
            } else {
              inserted++
            }
          }

        } catch (err: any) {
          console.error(`\n   ❌ API error: ${err.message}`)
          errors++
          break
        }

      } while (pageToken)

      process.stdout.write(`✅  (${inserted} total)\n`)

      // Small delay between category searches
      await sleep(300)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅  Seeding complete`)
  console.log(`    Venues inserted/updated: ${inserted}`)
  console.log(`    Duplicates skipped:      ${skipped}`)
  console.log(`    Errors:                  ${errors}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nNext step: wire app to Supabase so venues appear in the app')
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seedMiami().catch(err => {
  console.error('❌  Seeding failed:', err)
  process.exit(1)
})
