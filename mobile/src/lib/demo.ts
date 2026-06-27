/**
 * SkipTheLine — Demo Mode Layer
 *
 * DEMO_MODE = true  → overlay mock activity on real venue data (no DB writes)
 * DEMO_MODE = false → read everything live from Supabase (production)
 *
 * Flip this one flag when real users start reporting.
 */

export const DEMO_MODE = true

import type { Venue } from './queries'

// ─── Deterministic helpers (same result every run, based on venue ID) ─────────

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

function seededRand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

// ─── Wait time by category ────────────────────────────────────────────────────

const CATEGORY_WAIT_RANGES: Record<string, [number, number]> = {
  restaurants:   [8,  65],
  entertainment: [20, 80],
  barbershops:   [5,  35],
  grocery:       [3,  20],
  government:    [45, 120],
  healthcare:    [30, 90],
  retail:        [5,  25],
  landmarks:     [0,  15],
  attractions:   [10, 45],
}

// ─── Demo friends ─────────────────────────────────────────────────────────────

export const DEMO_FRIENDS = [
  { id: 'df1', name: 'Sofía',  handle: '@sofia',  initial: 'S' },
  { id: 'df2', name: 'Marcus', handle: '@marcus', initial: 'M' },
  { id: 'df3', name: 'Maya',   handle: '@maya',   initial: 'M' },
  { id: 'df4', name: 'Theo',   handle: '@theo',   initial: 'T' },
]

// ─── Demo reporters (anonymous names for recent reports) ──────────────────────

const REPORTER_NAMES = ['Sofía', 'Marcus', 'Devon', 'Priya', 'Aisha', 'Rico', 'Maya', 'Carlos', 'Nina', 'Theo']
const REPORT_TYPES   = ['walk-in', 'reservation', 'walk-in', 'walk-in', 'guest list', 'counter']
const REPORT_NOTES   = [
  'Line moving fast.',
  'Bar seating is faster.',
  'Came right in.',
  'Wait was shorter than expected.',
  'Weekend rush — grab a drink while you wait.',
  'Self-checkout was empty.',
  null, null, null, // most reports have no note
]

// ─── Apply demo overlay to a venue ────────────────────────────────────────────

export function applyDemoOverlay(venue: Venue): Venue {
  if (!DEMO_MODE) return venue

  const seed = hashId(venue.id)
  const [minWait, maxWait] = CATEGORY_WAIT_RANGES[venue.category] ?? [0, 30]

  // ~20% of venues have no wait yet (first to report state)
  const hasData = seed % 5 !== 0

  const waitMinutes   = hasData ? seededRand(seed, minWait, maxWait) : 0
  const liveReporters = hasData ? seededRand(seed + 1, 1, 12) : 0
  const reportsCount  = hasData ? seededRand(seed + 2, 3, 45) : 0
  const severity      = waitMinutes <= 15 ? 'short' : waitMinutes <= 45 ? 'moderate' : 'long'
  const trend         = (['up', 'down', 'flat'] as const)[seed % 3]

  return {
    ...venue,
    current_wait_minutes: waitMinutes,
    typical_wait_minutes: seededRand(seed + 3, minWait, maxWait),
    live_reporters:       liveReporters,
    reports_count:        reportsCount,
    severity,
    trend,
  }
}

// ─── Apply demo overlay to a list of venues ───────────────────────────────────

export function applyDemoOverlayAll(venues: Venue[]): Venue[] {
  if (!DEMO_MODE) return venues
  return venues.map(applyDemoOverlay)
}

// ─── Generate mock recent reports for venue detail ────────────────────────────

export function getDemoReports(venue: Venue, count = 4) {
  if (!DEMO_MODE || venue.reports_count === 0) return []

  const seed = hashId(venue.id)
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 7
    const name = REPORTER_NAMES[s % REPORTER_NAMES.length]
    const minsAgo = seededRand(s, 1, 45)
    const wait = seededRand(s + 1, Math.max(0, venue.current_wait_minutes - 15), venue.current_wait_minutes + 15)
    return {
      id:           `demo-${venue.id}-${i}`,
      venue_id:     venue.id,
      wait_minutes: wait,
      report_type:  REPORT_TYPES[s % REPORT_TYPES.length],
      note:         REPORT_NOTES[s % REPORT_NOTES.length],
      created_at:   new Date(Date.now() - minsAgo * 60000).toISOString(),
      users:        i < 2 ? [{ name, handle: `@${name.toLowerCase()}` }] : null,
    }
  })
}

// ─── Demo explore feed items using real venues ────────────────────────────────

export function getDemoFeedItems(venues: Venue[]) {
  if (!DEMO_MODE || venues.length === 0) return []

  const activeVenues = venues.filter(v => v.current_wait_minutes > 0)
  if (activeVenues.length === 0) return []

  const items: any[] = []
  const now = Date.now()

  // Drop events
  const dropVenues = activeVenues.slice(0, 3)
  dropVenues.forEach((v, i) => {
    const seed = hashId(v.id) + i
    const from = v.current_wait_minutes + seededRand(seed, 10, 25)
    items.push({
      id:      `demo-drop-${v.id}`,
      kind:    'drop',
      venueId: v.id,
      from,
      to:      v.current_wait_minutes,
      ago:     `${seededRand(seed, 1, 8)}m`,
    })
  })

  // Live reports
  const reportVenues = activeVenues.slice(3, 7)
  reportVenues.forEach((v, i) => {
    const seed = hashId(v.id) + i + 100
    const name    = REPORTER_NAMES[seed % REPORTER_NAMES.length]
    const initial = name.charAt(0)
    const note    = REPORT_NOTES[seed % REPORT_NOTES.length]
    items.push({
      id:      `demo-report-${v.id}`,
      kind:    'report',
      venueId: v.id,
      user:    name,
      initial,
      minutes: v.current_wait_minutes,
      ago:     `${seededRand(seed, 1, 12)}m`,
      quote:   note,
    })
  })

  // Venue showcases
  const showcaseVenues = activeVenues.slice(7, 10)
  showcaseVenues.forEach((v, i) => {
    const seed = hashId(v.id) + i + 200
    items.push({
      id:      `demo-venue-${v.id}`,
      kind:    'venue',
      venueId: v.id,
      ago:     `${seededRand(seed, 5, 20)}m`,
    })
  })

  // System notifications
  items.push({
    id:    'demo-sys-1',
    kind:  'system',
    ago:   '4m',
    title: '+25 SkipPoints',
    body:  'Your report at Komodo was confirmed by 4 people.',
    emoji: '✨',
  })
  items.push({
    id:    'demo-sys-2',
    kind:  'system',
    ago:   '12m',
    title: 'Badge earned: Night Owl 🦉',
    body:  'You reported 5 venues after 11pm this week.',
    emoji: '🏆',
  })

  // Sort by ago (rough)
  return items
}

// ─── Demo profile data ─────────────────────────────────────────────────────────

export const DEMO_PROFILE = {
  name:             'Alex Rivera',
  handle:           '@alexr',
  city:             'Miami',
  neighborhood:     'Brickell',
  points:           2840,
  streak:           12,
  rank:             47,
  rank_trend:       'up' as const,
  rank_delta:       5,
  reports_count:    134,
  reports_this_week: 23,
}
