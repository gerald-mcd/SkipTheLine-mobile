/**
 * SkipTheLine — Supabase query functions
 * Single source of truth for all DB reads.
 * Every screen imports from here, not directly from supabase client.
 */

import { supabase } from './supabase'
import { DEMO_MODE, applyDemoOverlayAll, getDemoReports, applyDemoOverlay } from './demo'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Venue {
  id:                   string
  name:                 string
  category:             string
  category_label:       string
  lat:                  number
  lng:                  number
  address:              string
  city:                 string
  neighborhood:         string | null
  hours:                string | null
  phone:                string | null
  website:              string | null
  price_range:          string | null
  vibe:                 string | null
  google_rating:        number | null
  average_rating:       number
  google_photo_ref:     string | null
  primary_image_url:    string | null
  current_wait_minutes: number
  typical_wait_minutes: number
  live_reporters:       number
  reports_count:        number
  trend:                string
  severity:             string | null
  is_launched:          boolean
  google_place_id:      string | null
  last_report_at:       string | null
}

export interface WaitCache {
  venue_id:             string
  computed_wait:        number
  has_live_data:        boolean
  confidence:           number
  last_computed_at:     string
}

export interface Report {
  id:           string
  venue_id:     string
  wait_minutes: number
  report_type:  string | null
  note:         string | null
  created_at:   string
  users:        { name: string; handle: string }[] | null
}

export interface VenueReview {
  id:          string
  stars:       number
  text:        string | null
  source:      string
  author_name: string | null
  created_at:  string
  users:       { name: string }[] | null
}

export interface UserProfile {
  id:                   string
  name:                 string
  handle:               string
  email:                string
  city:                 string | null
  neighborhood:         string | null
  points:               number
  streak:               number
  rank:                 number | null
  rank_trend:           string
  rank_delta:           number
  reports_count:        number
  reports_this_week:    number
  trust_score:          number
  is_test_user:         boolean
  avatar_url:           string | null
  avatar_initial:       string | null
}

// ─── VENUES ───────────────────────────────────────────────────────────────────

/** Get all launched venues near a city, sorted by live reporters */
export async function getLaunchedVenues(city = 'Miami'): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      id, name, category, category_label, lat, lng, address, city,
      neighborhood, hours, phone, website, price_range, vibe,
      google_rating, average_rating, google_photo_ref, primary_image_url,
      current_wait_minutes, typical_wait_minutes, live_reporters,
      reports_count, trend, severity, is_launched, google_place_id
    `)
    .eq('is_launched', true)
    .eq('city', city)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) { console.error('getLaunchedVenues:', error.message); return [] }
  const venues = (data ?? []) as Venue[]
  return DEMO_MODE ? applyDemoOverlayAll(venues) : venues
}

/** Get venues by category */
export async function getVenuesByCategory(
  category: string,
  city = 'Miami'
): Promise<Venue[]> {
  const query = supabase
    .from('venues')
    .select(`
      id, name, category, category_label, lat, lng, address, city,
      neighborhood, hours, price_range, vibe, google_rating, average_rating,
      primary_image_url, current_wait_minutes, typical_wait_minutes,
      live_reporters, reports_count, trend, severity, is_launched
    `)
    .eq('is_launched', true)
    .eq('city', city)
    .eq('is_active', true)
    .order('live_reporters', { ascending: false })

  if (category !== 'all') query.eq('category', category)

  const { data, error } = await query
  if (error) { console.error('getVenuesByCategory:', error.message); return [] }
  return (data ?? []) as Venue[]
}

/** Get single venue by ID */
export async function getVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.error('getVenueById:', error.message); return null }
  return data as Venue
}

/** Search venues by name */
export async function searchVenues(query: string, city = 'Miami'): Promise<Venue[]> {
  if (!query.trim()) return getLaunchedVenues(city)

  const { data, error } = await supabase
    .from('venues')
    .select(`
      id, name, category, category_label, lat, lng, address,
      primary_image_url, current_wait_minutes, live_reporters,
      trend, severity, is_launched
    `)
    .eq('is_launched', true)
    .eq('city', city)
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .order('live_reporters', { ascending: false })
    .limit(20)

  if (error) { console.error('searchVenues:', error.message); return [] }
  return (data ?? []) as Venue[]
}

/** Get venues with short waits only */
export async function getShortWaitVenues(city = 'Miami'): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      id, name, category, category_label, lat, lng, address,
      primary_image_url, current_wait_minutes, live_reporters,
      trend, severity, is_launched
    `)
    .eq('is_launched', true)
    .eq('city', city)
    .eq('is_active', true)
    .lte('current_wait_minutes', 15)
    .order('current_wait_minutes', { ascending: true })

  if (error) { console.error('getShortWaitVenues:', error.message); return [] }
  return (data ?? []) as Venue[]
}

// ─── WAIT TIMES ───────────────────────────────────────────────────────────────

/** Get current computed wait for a venue */
export async function getWaitCache(venueId: string): Promise<WaitCache | null> {
  const { data, error } = await supabase
    .from('wait_time_cache')
    .select('*')
    .eq('venue_id', venueId)
    .single()

  if (error) return null
  return data as WaitCache
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

/** Get recent reports for a venue */
export async function getVenueReports(venueId: string, limit = 10): Promise<Report[]> {
  if (DEMO_MODE) {
    // Return mock reports — no DB read needed
    const venue = await getVenueById(venueId)
    if (!venue) return []
    const overlaid = applyDemoOverlay(venue)
    return getDemoReports(overlaid, limit) as unknown as Report[]
  }

  const { data, error } = await supabase
    .from('reports')
    .select(`
      id, venue_id, wait_minutes, report_type, note, created_at,
      users (name, handle)
    `)
    .eq('venue_id', venueId)
    .eq('flagged', false)
    .eq('is_live', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('getVenueReports:', error.message); return [] }
  return (data ?? []) as unknown as Report[]
}

/** Submit a wait time report */
export async function submitReport(
  venueId: string,
  waitMinutes: number,
  reportType: string,
  note: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('reports').insert({
    venue_id:     venueId,
    user_id:      userId,
    wait_minutes: waitMinutes,
    report_type:  reportType,
    note:         note || null,
    platform:     'ios',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

/** Get reviews for a venue */
export async function getVenueReviews(venueId: string, limit = 5): Promise<VenueReview[]> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select(`
      id, stars, text, source, author_name, created_at,
      users (name)
    `)
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('getVenueReviews:', error.message); return [] }
  return (data ?? []) as unknown as VenueReview[]
}

// ─── VENUE HOURS ──────────────────────────────────────────────────────────────

export interface VenueHour {
  day_of_week: number   // 0=Sun, 1=Mon...6=Sat
  open_time:   string | null
  close_time:  string | null
  is_closed:   boolean
  is_24h:      boolean
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function getVenueHours(venueId: string): Promise<VenueHour[]> {
  const { data, error } = await supabase
    .from('venue_hours')
    .select('day_of_week, open_time, close_time, is_closed, is_24h')
    .eq('venue_id', venueId)
    .order('day_of_week', { ascending: true })

  if (error) return []
  return (data ?? []) as VenueHour[]
}

/** Format a time string like "12:00" → "12:00 PM" */
function formatTime(t: string | null): string {
  if (!t) return ''
  const [hStr, mStr] = t.split(':')
  let h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return m === 0 ? `${h} ${ampm}` : `${h}:${mStr} ${ampm}`
}

/** Get today's hours as a display string e.g. "12 PM – 1 AM" */
export function getTodayHours(hours: VenueHour[]): { label: string; isOpen: boolean } {
  const today = new Date().getDay() // 0=Sun
  const todayHours = hours.find(h => h.day_of_week === today)

  if (!todayHours) return { label: 'Hours unavailable', isOpen: false }
  if (todayHours.is_closed) return { label: 'Closed today', isOpen: false }
  if (todayHours.is_24h) return { label: 'Open 24 hours', isOpen: true }

  const open  = formatTime(todayHours.open_time)
  const close = formatTime(todayHours.close_time)
  const label = open && close ? `${open} – ${close}` : 'Hours unavailable'

  // Rough open/closed check
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const [oh, om] = (todayHours.open_time ?? '00:00').split(':').map(Number)
  let [ch, cm]   = (todayHours.close_time ?? '23:59').split(':').map(Number)
  const openMin  = oh * 60 + om
  let closeMin   = ch * 60 + cm
  if (closeMin < openMin) closeMin += 1440 // past midnight
  const isOpen   = nowMinutes >= openMin && nowMinutes < closeMin

  return { label, isOpen }
}

/** Format all hours for the expanded view */
export function formatAllHours(hours: VenueHour[]): { day: string; label: string }[] {
  return DAY_FULL.map((day, i) => {
    const h = hours.find(h => h.day_of_week === i)
    if (!h) return { day, label: '–' }
    if (h.is_closed) return { day, label: 'Closed' }
    if (h.is_24h)    return { day, label: 'Open 24 hours' }
    const open  = formatTime(h.open_time)
    const close = formatTime(h.close_time)
    return { day, label: open && close ? `${open} – ${close}` : '–' }
  })
}

// ─── VENUE PHOTOS ─────────────────────────────────────────────────────────────

/** Get all photos for a venue */
export async function getVenuePhotos(venueId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('venue_photos')
    .select('url')
    .eq('venue_id', venueId)
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []).map(p => p.url)
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

/** Get user profile by auth ID */
export async function getUserProfile(authId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, name, handle, email, city, neighborhood, points, streak,
      rank, rank_trend, rank_delta, reports_count, reports_this_week,
      trust_score, is_test_user, avatar_url, avatar_initial
    `)
    .eq('auth_id', authId)
    .single()

  if (error) { console.error('getUserProfile:', error.message); return null }
  return data as UserProfile
}

// ─── FAVORITES ────────────────────────────────────────────────────────────────

/** Get user's favorited venue IDs */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('venue_id')
    .eq('user_id', userId)

  if (error) return []
  return (data ?? []).map(f => f.venue_id)
}

/** Toggle a favorite */
export async function toggleFavorite(
  userId: string,
  venueId: string,
  isFavorited: boolean
): Promise<void> {
  if (isFavorited) {
    await supabase.from('favorites').delete()
      .eq('user_id', userId).eq('venue_id', venueId)
  } else {
    await supabase.from('favorites').upsert(
      { user_id: userId, venue_id: venueId },
      { onConflict: 'user_id,venue_id' }
    )
  }
}

// ─── APP CONFIG ───────────────────────────────────────────────────────────────

/** Get a single config value */
export async function getConfig(key: string): Promise<any> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .single()

  if (error) return null
  return data?.value
}
