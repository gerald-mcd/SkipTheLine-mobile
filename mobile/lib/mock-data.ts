// Mirror of the Lovable mock data — used until real Supabase data is wired up

export type Severity = 'short' | 'moderate' | 'long'
export type Category = 'restaurants' | 'barbershops' | 'grocery' | 'government' | 'healthcare' | 'retail' | 'entertainment' | 'landmarks' | 'attractions'

export interface Venue {
  id: string
  name: string
  category: Category
  categoryLabel: string
  waitMinutes: number
  severity: Severity
  distance: string
  reportsCount: number
  lastReportMinutes: number
  trend: 'up' | 'down' | 'flat'
  event?: string
  lat: number
  lng: number
  hours: string
  address: string
  liveReporters: number
  image: string
  vibe: string
  typicalWaitMinutes: number
  reporterNames: string[]
  recentQuote: { text: string; author: string; ago: string }
}

export const venues: Venue[] = [
  { id: 'v1', name: 'Komodo', category: 'restaurants', categoryLabel: 'Restaurant', waitMinutes: 42, severity: 'long', distance: '0.2 mi', reportsCount: 18, lastReportMinutes: 2, trend: 'up', event: 'Friday Rush', lat: 25.7617, lng: -80.1918, hours: '5pm – 2am', address: '801 Brickell Plaza', liveReporters: 6, vibe: 'Pan-Asian · Buzzy', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', typicalWaitMinutes: 55, reporterNames: ['Sofía', 'Marcus', 'Devon'], recentQuote: { text: 'Seated in 38 — bar moves faster.', author: 'Sofía', ago: '2m' } },
  { id: 'v2', name: 'Sugar Rooftop', category: 'entertainment', categoryLabel: 'Rooftop Lounge', waitMinutes: 55, severity: 'long', distance: '0.4 mi', reportsCount: 31, lastReportMinutes: 1, trend: 'up', event: 'Sunset DJ set', lat: 25.7640, lng: -80.1890, hours: '5pm – 2am', address: '788 Brickell Plaza', liveReporters: 14, vibe: 'Asian garden · Skyline', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80', typicalWaitMinutes: 60, reporterNames: ['Devon', 'Priya', 'Rico'], recentQuote: { text: 'Elevator line is the bottleneck.', author: 'Devon', ago: '1m' } },
  { id: 'v3', name: 'Brickell Barber Shop', category: 'barbershops', categoryLabel: 'Barbershop', waitMinutes: 8, severity: 'short', distance: '0.3 mi', reportsCount: 5, lastReportMinutes: 4, trend: 'down', lat: 25.7590, lng: -80.1930, hours: '9am – 8pm', address: '1450 Brickell Ave', liveReporters: 2, vibe: 'Classic cuts', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', typicalWaitMinutes: 20, reporterNames: ['Marcus', 'Theo'], recentQuote: { text: 'Walked right in. Chair open.', author: 'Marcus', ago: '4m' } },
  { id: 'v4', name: 'Whole Foods Brickell', category: 'grocery', categoryLabel: 'Grocery', waitMinutes: 12, severity: 'moderate', distance: '0.3 mi', reportsCount: 22, lastReportMinutes: 6, trend: 'flat', lat: 25.7605, lng: -80.1905, hours: '7am – 10pm', address: '299 SE 3rd St', liveReporters: 9, vibe: 'Self-checkout open', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', typicalWaitMinutes: 10, reporterNames: ['Carlos', 'Nina'], recentQuote: { text: 'Self-checkout zero wait.', author: 'Carlos', ago: '6m' } },
  { id: 'v5', name: 'La Mar by Gastón Acurio', category: 'restaurants', categoryLabel: 'Peruvian', waitMinutes: 25, severity: 'moderate', distance: '0.5 mi', reportsCount: 12, lastReportMinutes: 3, trend: 'down', lat: 25.7625, lng: -80.1870, hours: '12pm – 11pm', address: '500 Brickell Key Dr', liveReporters: 4, vibe: 'Waterfront · Ceviche', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', typicalWaitMinutes: 45, reporterNames: ['Aisha', 'Rico'], recentQuote: { text: 'Dropped 15 min in the last half hour.', author: 'Aisha', ago: '3m' } },
]

export const categories: { id: Category | 'all'; label: string; emoji: string }[] = [
  { id: 'all',           label: 'All',           emoji: '✨' },
  { id: 'restaurants',   label: 'Restaurants',   emoji: '🍽️' },
  { id: 'barbershops',   label: 'Barbershops',   emoji: '💈' },
  { id: 'grocery',       label: 'Grocery',       emoji: '🛒' },
  { id: 'government',    label: 'Government',    emoji: '🏛️' },
  { id: 'healthcare',    label: 'Healthcare',    emoji: '⚕️' },
  { id: 'retail',        label: 'Retail',        emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'landmarks',     label: 'Landmarks',     emoji: '🗽' },
  { id: 'attractions',   label: 'Attractions',   emoji: '🎡' },
]

export function getWaitColor(severity: Severity | null): string {
  if (!severity) return '#8E8E93'
  if (severity === 'short')    return '#34C759'
  if (severity === 'moderate') return '#FF9500'
  return '#FF3B30'
}

export function getWaitLabel(minutes: number): string {
  if (minutes === 0)  return 'No wait'
  if (minutes <= 10)  return `${minutes} min`
  if (minutes <= 25)  return `~${minutes} min`
  return `${minutes}+ min`
}

export const profile = {
  name: 'Alex Rivera',
  handle: '@alexr',
  city: 'Miami',
  neighborhood: 'Wynwood',
  points: 2840,
  streak: 12,
  rank: 47,
  reportsThisWeek: 23,
  avatar: '🦸',
  badges: [
    { id: 'b1', name: 'First Drop',  emoji: '🎯', earned: true },
    { id: 'b2', name: 'Night Owl',   emoji: '🦉', earned: true },
    { id: 'b3', name: 'Streak x10',  emoji: '🔥', earned: true },
    { id: 'b4', name: 'Local Hero',  emoji: '🏆', earned: true },
    { id: 'b5', name: 'Event Scout', emoji: '🎪', earned: false },
    { id: 'b6', name: '100 Club',    emoji: '💯', earned: false },
  ],
}
