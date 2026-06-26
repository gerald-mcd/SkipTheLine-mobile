export type Severity = 'short' | 'moderate' | 'long'
export type Category =
  | 'restaurants'
  | 'barbershops'
  | 'grocery'
  | 'government'
  | 'healthcare'
  | 'retail'
  | 'entertainment'
  | 'landmarks'
  | 'attractions'

export interface VenueReview {
  id: string
  name: string
  source: 'GOOGLE' | 'COMMUNITY'
  stars: number
  text: string
  ago: string
}

export interface VenueReport {
  id: string
  initial: string | null
  name: string
  isFriend: boolean
  type: string
  agoText: string
  waitMinutes: number
}

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
  photos: string[]
  reviews: VenueReview[]
  recentReports: VenueReport[]
  averageRating: number
  priceRange?: string
}

export const venues: Venue[] = [
  {
    id: 'v1',
    name: 'Komodo',
    category: 'restaurants',
    categoryLabel: 'Restaurant',
    waitMinutes: 42,
    severity: 'long',
    distance: '0.2 mi',
    reportsCount: 18,
    lastReportMinutes: 2,
    trend: 'up',
    event: 'Friday Rush',
    lat: 25.7617,
    lng: -80.1918,
    hours: '5pm – 2am',
    address: '801 Brickell Plaza',
    liveReporters: 6,
    vibe: 'Pan-Asian · Buzzy',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    typicalWaitMinutes: 55,
    reporterNames: ['Sofía', 'Marcus', 'Devon'],
    recentQuote: { text: 'Seated in 38 — bar moves faster.', author: 'Sofía', ago: '2m' },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    ],
    reviews: [
      { id: 'rv1a', name: 'Elena V.', source: 'GOOGLE', stars: 5, text: 'Best pan-Asian in Brickell, hands down. The atmosphere is electric on weekends.', ago: '2d' },
      { id: 'rv1b', name: 'Jordan K.', source: 'COMMUNITY', stars: 4, text: 'Food is incredible but expect a wait on Friday nights. Bar seating is faster.', ago: '5d' },
      { id: 'rv1c', name: 'Camila R.', source: 'GOOGLE', stars: 4, text: 'Stunning three-story venue. Sushi was fresh and the cocktails were creative.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp1a', initial: 'S', name: 'Sofía', isFriend: true, type: 'walk-in', agoText: '2m', waitMinutes: 42 },
      { id: 'rp1b', initial: 'M', name: 'Marcus', isFriend: true, type: 'walk-in', agoText: '8m', waitMinutes: 38 },
      { id: 'rp1c', initial: null, name: 'Someone nearby', isFriend: false, type: 'reservation', agoText: '12m', waitMinutes: 15 },
      { id: 'rp1d', initial: 'D', name: 'Devon', isFriend: true, type: 'walk-in', agoText: '18m', waitMinutes: 50 },
    ],
    averageRating: 4.6,
    priceRange: '$$$',
  },
  {
    id: 'v2',
    name: 'Sugar Rooftop',
    category: 'entertainment',
    categoryLabel: 'Rooftop Lounge',
    waitMinutes: 55,
    severity: 'long',
    distance: '0.4 mi',
    reportsCount: 31,
    lastReportMinutes: 1,
    trend: 'up',
    event: 'Sunset DJ set',
    lat: 25.764,
    lng: -80.189,
    hours: '5pm – 2am',
    address: '788 Brickell Plaza',
    liveReporters: 14,
    vibe: 'Asian garden · Skyline',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80',
    typicalWaitMinutes: 60,
    reporterNames: ['Devon', 'Priya', 'Rico'],
    recentQuote: { text: 'Elevator line is the bottleneck.', author: 'Devon', ago: '1m' },
    photos: [
      'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    ],
    reviews: [
      { id: 'rv2a', name: 'Priya S.', source: 'GOOGLE', stars: 5, text: 'The views are unmatched. Best rooftop in Miami for sunset cocktails.', ago: '1d' },
      { id: 'rv2b', name: 'Omar H.', source: 'COMMUNITY', stars: 4, text: 'Great vibe but the elevator wait adds 15 minutes. Go early.', ago: '3d' },
      { id: 'rv2c', name: 'Tanya W.', source: 'GOOGLE', stars: 3, text: 'Drinks are overpriced but the ambiance makes up for it. DJ was solid.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp2a', initial: 'D', name: 'Devon', isFriend: true, type: 'walk-in', agoText: '1m', waitMinutes: 55 },
      { id: 'rp2b', initial: 'P', name: 'Priya', isFriend: true, type: 'walk-in', agoText: '4m', waitMinutes: 60 },
      { id: 'rp2c', initial: null, name: 'Someone nearby', isFriend: false, type: 'walk-in', agoText: '6m', waitMinutes: 48 },
      { id: 'rp2d', initial: 'R', name: 'Rico', isFriend: true, type: 'guest list', agoText: '10m', waitMinutes: 20 },
    ],
    averageRating: 4.3,
  },
  {
    id: 'v3',
    name: 'Brickell Barber Shop',
    category: 'barbershops',
    categoryLabel: 'Barbershop',
    waitMinutes: 8,
    severity: 'short',
    distance: '0.3 mi',
    reportsCount: 5,
    lastReportMinutes: 4,
    trend: 'down',
    lat: 25.759,
    lng: -80.193,
    hours: '9am – 8pm',
    address: '1450 Brickell Ave',
    liveReporters: 2,
    vibe: 'Classic cuts',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    typicalWaitMinutes: 20,
    reporterNames: ['Marcus', 'Theo'],
    recentQuote: { text: 'Walked right in. Chair open.', author: 'Marcus', ago: '4m' },
    photos: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
      'https://images.unsplash.com/photo-1585747860874-a17e25d71cda?w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    ],
    reviews: [
      { id: 'rv3a', name: 'Theo G.', source: 'GOOGLE', stars: 5, text: 'Best fade in Brickell. Ask for Danny — he never misses.', ago: '3d' },
      { id: 'rv3b', name: 'Andre L.', source: 'COMMUNITY', stars: 4, text: 'Quick service and clean shop. Walk-ins welcome most days.', ago: '1w' },
      { id: 'rv3c', name: 'Jason P.', source: 'GOOGLE', stars: 5, text: 'Old school vibes with modern cuts. Fair prices too.', ago: '2w' },
    ],
    recentReports: [
      { id: 'rp3a', initial: 'M', name: 'Marcus', isFriend: true, type: 'walk-in', agoText: '4m', waitMinutes: 8 },
      { id: 'rp3b', initial: 'T', name: 'Theo', isFriend: true, type: 'walk-in', agoText: '15m', waitMinutes: 12 },
      { id: 'rp3c', initial: null, name: 'Someone nearby', isFriend: false, type: 'walk-in', agoText: '30m', waitMinutes: 5 },
    ],
    averageRating: 4.7,
  },
  {
    id: 'v4',
    name: 'Whole Foods Brickell',
    category: 'grocery',
    categoryLabel: 'Grocery',
    waitMinutes: 12,
    severity: 'moderate',
    distance: '0.3 mi',
    reportsCount: 22,
    lastReportMinutes: 6,
    trend: 'flat',
    lat: 25.7605,
    lng: -80.1905,
    hours: '7am – 10pm',
    address: '299 SE 3rd St',
    liveReporters: 9,
    vibe: 'Self-checkout open',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    typicalWaitMinutes: 10,
    reporterNames: ['Carlos', 'Nina'],
    recentQuote: { text: 'Self-checkout zero wait.', author: 'Carlos', ago: '6m' },
    photos: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
      'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
    ],
    reviews: [
      { id: 'rv4a', name: 'Nina B.', source: 'GOOGLE', stars: 4, text: 'Great selection and the hot bar is solid for lunch. Self-checkout saves time.', ago: '2d' },
      { id: 'rv4b', name: 'Carlos M.', source: 'COMMUNITY', stars: 4, text: 'Produce quality is top notch. Skip the regular checkout lanes.', ago: '4d' },
      { id: 'rv4c', name: 'Hannah T.', source: 'GOOGLE', stars: 3, text: 'Crowded on weekends. Go before 9am for the best experience.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp4a', initial: 'C', name: 'Carlos', isFriend: true, type: 'self-checkout', agoText: '6m', waitMinutes: 0 },
      { id: 'rp4b', initial: null, name: 'Someone nearby', isFriend: false, type: 'regular lane', agoText: '10m', waitMinutes: 12 },
      { id: 'rp4c', initial: 'N', name: 'Nina', isFriend: true, type: 'regular lane', agoText: '22m', waitMinutes: 15 },
      { id: 'rp4d', initial: null, name: 'Someone nearby', isFriend: false, type: 'self-checkout', agoText: '35m', waitMinutes: 3 },
    ],
    averageRating: 4.1,
  },
  {
    id: 'v5',
    name: 'La Mar by Gastón Acurio',
    category: 'restaurants',
    categoryLabel: 'Peruvian',
    waitMinutes: 25,
    severity: 'moderate',
    distance: '0.5 mi',
    reportsCount: 12,
    lastReportMinutes: 3,
    trend: 'down',
    lat: 25.7625,
    lng: -80.187,
    hours: '12pm – 11pm',
    address: '500 Brickell Key Dr',
    liveReporters: 4,
    vibe: 'Waterfront · Ceviche',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    typicalWaitMinutes: 45,
    reporterNames: ['Aisha', 'Rico'],
    recentQuote: { text: 'Dropped 15 min in the last half hour.', author: 'Aisha', ago: '3m' },
    photos: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
    ],
    reviews: [
      { id: 'rv5a', name: 'Aisha N.', source: 'COMMUNITY', stars: 5, text: 'The ceviche is life-changing. Waterfront table at sunset is a must.', ago: '3d' },
      { id: 'rv5b', name: 'Ricardo F.', source: 'GOOGLE', stars: 4, text: 'Authentic Peruvian flavors. Pisco sour is perfectly balanced.', ago: '5d' },
      { id: 'rv5c', name: 'Daniela M.', source: 'GOOGLE', stars: 5, text: 'Worth every penny. The anticuchos were incredible.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp5a', initial: 'A', name: 'Aisha', isFriend: true, type: 'walk-in', agoText: '3m', waitMinutes: 25 },
      { id: 'rp5b', initial: null, name: 'Someone nearby', isFriend: false, type: 'reservation', agoText: '8m', waitMinutes: 10 },
      { id: 'rp5c', initial: 'R', name: 'Rico', isFriend: true, type: 'walk-in', agoText: '20m', waitMinutes: 40 },
    ],
    averageRating: 4.7,
    priceRange: '$$$',
  },
  {
    id: 'v6',
    name: 'Pura Vida',
    category: 'restaurants',
    categoryLabel: 'Health Café',
    waitMinutes: 7,
    severity: 'short',
    distance: '0.2 mi',
    reportsCount: 8,
    lastReportMinutes: 5,
    trend: 'flat',
    lat: 25.7598,
    lng: -80.1912,
    hours: '7am – 10pm',
    address: '1000 Brickell Ave',
    liveReporters: 3,
    vibe: 'Açaí · Smoothies',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80',
    typicalWaitMinutes: 8,
    reporterNames: ['Mia', 'Jake'],
    recentQuote: { text: 'In and out in 5. Acai bowl 🔥', author: 'Mia', ago: '5m' },
    photos: [
      'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
      'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&q=80',
    ],
    reviews: [
      { id: 'rv6a', name: 'Mia C.', source: 'COMMUNITY', stars: 5, text: 'Best acai bowls in Miami. Fresh ingredients and huge portions.', ago: '1d' },
      { id: 'rv6b', name: 'Jake W.', source: 'GOOGLE', stars: 4, text: 'Healthy, fast, and tasty. The green smoothie is my go-to.', ago: '4d' },
      { id: 'rv6c', name: 'Valentina S.', source: 'GOOGLE', stars: 5, text: 'Love the vibe here. Outdoor seating is perfect for morning coffee.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp6a', initial: null, name: 'Someone nearby', isFriend: false, type: 'counter order', agoText: '5m', waitMinutes: 7 },
      { id: 'rp6b', initial: 'M', name: 'Mia', isFriend: true, type: 'counter order', agoText: '12m', waitMinutes: 5 },
      { id: 'rp6c', initial: null, name: 'Someone nearby', isFriend: false, type: 'counter order', agoText: '25m', waitMinutes: 10 },
    ],
    averageRating: 4.8,
    priceRange: '$$',
  },
  {
    id: 'v7',
    name: 'Brickell City Centre',
    category: 'retail',
    categoryLabel: 'Mall',
    waitMinutes: 18,
    severity: 'moderate',
    distance: '0.4 mi',
    reportsCount: 14,
    lastReportMinutes: 7,
    trend: 'up',
    lat: 25.7648,
    lng: -80.193,
    hours: '10am – 9pm',
    address: '701 S Miami Ave',
    liveReporters: 7,
    vibe: 'Upscale shopping',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    typicalWaitMinutes: 15,
    reporterNames: ['Leo', 'Sara'],
    recentQuote: { text: 'Parking is the real wait — 20min.', author: 'Leo', ago: '7m' },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
      'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800&q=80',
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&q=80',
    ],
    reviews: [
      { id: 'rv7a', name: 'Leo T.', source: 'GOOGLE', stars: 4, text: 'Beautiful open-air mall. Parking is brutal on weekends though.', ago: '2d' },
      { id: 'rv7b', name: 'Sara K.', source: 'COMMUNITY', stars: 4, text: 'Great mix of luxury and mid-range stores. Saks is the highlight.', ago: '6d' },
      { id: 'rv7c', name: 'Michelle Y.', source: 'GOOGLE', stars: 3, text: 'Food court is mediocre. Stick to the standalone restaurants nearby.', ago: '2w' },
    ],
    recentReports: [
      { id: 'rp7a', initial: 'L', name: 'Leo', isFriend: true, type: 'parking', agoText: '7m', waitMinutes: 20 },
      { id: 'rp7b', initial: null, name: 'Someone nearby', isFriend: false, type: 'Apple Store', agoText: '12m', waitMinutes: 18 },
      { id: 'rp7c', initial: 'S', name: 'Sara', isFriend: true, type: 'Zara checkout', agoText: '18m', waitMinutes: 10 },
      { id: 'rp7d', initial: null, name: 'Someone nearby', isFriend: false, type: 'parking', agoText: '25m', waitMinutes: 25 },
    ],
    averageRating: 4.2,
  },
  {
    id: 'v8',
    name: 'Brickell Key Park',
    category: 'landmarks',
    categoryLabel: 'Park',
    waitMinutes: 0,
    severity: 'short',
    distance: '0.6 mi',
    reportsCount: 3,
    lastReportMinutes: 15,
    trend: 'flat',
    lat: 25.7635,
    lng: -80.183,
    hours: 'Always open',
    address: 'Brickell Key Dr',
    liveReporters: 1,
    vibe: 'Waterfront walk',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    typicalWaitMinutes: 0,
    reporterNames: ['Tom'],
    recentQuote: { text: 'No line, beautiful sunset view.', author: 'Tom', ago: '15m' },
    photos: [
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    ],
    reviews: [
      { id: 'rv8a', name: 'Tom R.', source: 'GOOGLE', stars: 5, text: 'Hidden gem for sunset walks. Skyline views are breathtaking.', ago: '1d' },
      { id: 'rv8b', name: 'Lucia D.', source: 'COMMUNITY', stars: 4, text: 'Peaceful spot away from Brickell chaos. Great for morning jogs.', ago: '5d' },
      { id: 'rv8c', name: 'Kevin Z.', source: 'GOOGLE', stars: 5, text: 'Perfect picnic spot. Clean paths and always a nice breeze.', ago: '2w' },
    ],
    recentReports: [
      { id: 'rp8a', initial: null, name: 'Someone nearby', isFriend: false, type: 'visit', agoText: '15m', waitMinutes: 0 },
      { id: 'rp8b', initial: 'T', name: 'Tom', isFriend: true, type: 'visit', agoText: '40m', waitMinutes: 0 },
      { id: 'rp8c', initial: null, name: 'Someone nearby', isFriend: false, type: 'visit', agoText: '2h', waitMinutes: 0 },
    ],
    averageRating: 4.9,
  },
  {
    id: 'v9',
    name: 'Vice City Bean',
    category: 'restaurants',
    categoryLabel: 'Coffee',
    waitMinutes: 10,
    severity: 'moderate',
    distance: '0.1 mi',
    reportsCount: 9,
    lastReportMinutes: 2,
    trend: 'down',
    lat: 25.761,
    lng: -80.1925,
    hours: '6am – 6pm',
    address: '88 SW 7th St',
    liveReporters: 4,
    vibe: 'Local roast · Laptop crowd',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    typicalWaitMinutes: 12,
    reporterNames: ['Nadia', 'Ben'],
    recentQuote: { text: 'Line moving fast today, ~8min.', author: 'Nadia', ago: '2m' },
    photos: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    ],
    reviews: [
      { id: 'rv9a', name: 'Nadia F.', source: 'COMMUNITY', stars: 5, text: 'Best local roast in Brickell. The cortadito is a must-try.', ago: '2d' },
      { id: 'rv9b', name: 'Ben A.', source: 'GOOGLE', stars: 4, text: 'Solid wifi and great vibes for remote work. Gets crowded after 10am.', ago: '4d' },
      { id: 'rv9c', name: 'Sophie L.', source: 'GOOGLE', stars: 4, text: 'Pastries are fresh daily. The espresso is strong and well-balanced.', ago: '1w' },
    ],
    recentReports: [
      { id: 'rp9a', initial: null, name: 'Someone nearby', isFriend: false, type: 'counter order', agoText: '2m', waitMinutes: 10 },
      { id: 'rp9b', initial: 'N', name: 'Nadia', isFriend: true, type: 'counter order', agoText: '8m', waitMinutes: 8 },
      { id: 'rp9c', initial: 'B', name: 'Ben', isFriend: true, type: 'counter order', agoText: '15m', waitMinutes: 12 },
    ],
    averageRating: 4.5,
    priceRange: '$',
  },
]

export const liveFeed: { id: string; user: string; venue: string; minutes: number; ago: string }[] = [
  { id: 'f1', user: 'Marcus', venue: 'Brickell Barber Shop', minutes: 8,  ago: 'now' },
  { id: 'f2', user: 'Sofía',  venue: 'Komodo',               minutes: 42, ago: '1m' },
  { id: 'f3', user: 'Devon',  venue: 'Sugar Rooftop',        minutes: 65, ago: '1m' },
  { id: 'f4', user: 'Aisha',  venue: 'La Mar',               minutes: 25, ago: '3m' },
  { id: 'f5', user: 'Tyler',  venue: 'Brickell City Centre',  minutes: 35, ago: '2m' },
  { id: 'f6', user: 'Maya',   venue: 'Pura Vida',            minutes: 15, ago: '5m' },
  { id: 'f7', user: 'Carlos', venue: 'Whole Foods Brickell', minutes: 12, ago: '6m' },
]

export type FeedItem =
  | { id: string; kind: 'venue'; ago: string; venueId: string }
  | { id: string; kind: 'drop'; ago: string; venueId: string; from: number; to: number }
  | { id: string; kind: 'report'; ago: string; venueId: string; user: string; initial: string; minutes: number; quote?: string }
  | { id: string; kind: 'system'; ago: string; title: string; body: string; emoji: string }

export const exploreFeed: FeedItem[] = [
  { id: 'fd1', kind: 'drop', ago: 'now', venueId: 'v5', from: 40, to: 25 },
  { id: 'fd2', kind: 'report', ago: '1m', venueId: 'v1', user: 'Sofía', initial: 'S', minutes: 42, quote: 'Seated in 38 — bar moves faster.' },
  { id: 'fd3', kind: 'venue', ago: '2m', venueId: 'v2' },
  { id: 'fd4', kind: 'system', ago: '3m', title: '+25 SkipPoints', body: 'Your report at Coyo Taco was confirmed by 4 people.', emoji: '✨' },
  { id: 'fd5', kind: 'report', ago: '4m', venueId: 'v3', user: 'Marcus', initial: 'M', minutes: 8, quote: 'Walked right in. Chair open.' },
  { id: 'fd6', kind: 'drop', ago: '6m', venueId: 'v7', from: 50, to: 35 },
  { id: 'fd7', kind: 'venue', ago: '8m', venueId: 'v6' },
  { id: 'fd8', kind: 'system', ago: '12m', title: 'Voucher unlocked', body: "20% off at Joe's Stone Crab — tap to claim.", emoji: '🎟️' },
  { id: 'fd9', kind: 'report', ago: '14m', venueId: 'v4', user: 'Carlos', initial: 'C', minutes: 12, quote: 'Self-checkout zero wait.' },
  { id: 'fd10', kind: 'venue', ago: '18m', venueId: 'v8' },
  { id: 'fd11', kind: 'drop', ago: '22m', venueId: 'v9', from: 15, to: 4 },
  { id: 'fd12', kind: 'system', ago: '1h', title: 'Badge earned: Night Owl', body: 'Reported 5 venues after 11pm this week.', emoji: '🦉' },
]

export const staleVenues: Venue[] = [
  {
    id: 's1',
    name: 'DMV Brickell',
    category: 'government',
    categoryLabel: 'Government',
    waitMinutes: 95,
    severity: 'long',
    distance: '1.2 mi',
    reportsCount: 0,
    lastReportMinutes: 90,
    trend: 'flat',
    lat: 25.758,
    lng: -80.198,
    hours: '8am – 5pm',
    address: '2900 NW 7th Ave',
    liveReporters: 0,
    vibe: 'Bring snacks',
    image: 'https://images.unsplash.com/photo-1568745468016-b8da6b4e2dc2?w=800&q=80',
    typicalWaitMinutes: 90,
    reporterNames: [],
    recentQuote: { text: 'Typical DMV experience.', author: 'System', ago: '90m' },
    photos: [
      'https://images.unsplash.com/photo-1568745468016-b8da6b4e2dc2?w=800&q=80',
      'https://images.unsplash.com/photo-1577415124269-fc1140815e52?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    reviews: [
      { id: 'rvs1a', name: 'Maria G.', source: 'GOOGLE', stars: 3, text: 'Bring a book. You will be here a while.', ago: '1w' },
      { id: 'rvs1b', name: 'Frank D.', source: 'GOOGLE', stars: 3, text: 'Staff is polite but the system is slow. Arrive early.', ago: '2w' },
      { id: 'rvs1c', name: 'Denise P.', source: 'COMMUNITY', stars: 4, text: 'Went at 8am on a Tuesday, was out in under an hour.', ago: '3w' },
    ],
    recentReports: [
      { id: 'rps1a', initial: null, name: 'Someone nearby', isFriend: false, type: 'walk-in', agoText: '90m', waitMinutes: 95 },
      { id: 'rps1b', initial: null, name: 'Someone nearby', isFriend: false, type: 'appointment', agoText: '2h', waitMinutes: 45 },
      { id: 'rps1c', initial: null, name: 'Someone nearby', isFriend: false, type: 'walk-in', agoText: '3h', waitMinutes: 110 },
    ],
    averageRating: 3.8,
  },
]

export const tickerItems = [
  'Marcus · Brickell Barber Shop 8m · now',
  'Devon · Sugar Rooftop 55m · 1m',
  'Sofía · Komodo 42m · 2m',
  'Carlos · Whole Foods 12m · 6m',
  'Priya · Sugar Rooftop 55m · 4m',
  'Aisha · La Mar 25m · 3m',
  'Nadia · Vice City Bean 10m · 2m',
]

export const profile = {
  name: 'Alex Rivera',
  handle: '@alexr',
  city: 'Miami',
  neighborhood: 'Brickell',
  joinDate: 'Joined Jan 2024',
  points: 2840,
  streak: 12,
  rank: 47,
  reportsCount: 134,
  reportsThisWeek: 23,
  avatar: 'A',
  avatarGradient: ['#F8682B', '#F2934D'] as [string, string],
  nextTierPoints: 3000,
  badges: [
    { id: 'b1', name: 'First Drop',   icon: '🎯', emoji: '🎯', unlocked: true,  earned: true,  description: 'Submit your first report' },
    { id: 'b2', name: 'Night Owl',    icon: '🦉', emoji: '🦉', unlocked: true,  earned: true,  description: 'Report after midnight' },
    { id: 'b3', name: 'Streak x10',  icon: '🔥', emoji: '🔥', unlocked: true,  earned: true,  description: '10-day reporting streak' },
    { id: 'b4', name: 'Local Hero',   icon: '🏆', emoji: '🏆', unlocked: true,  earned: true,  description: 'Top reporter in your area' },
    { id: 'b5', name: 'Event Scout',  icon: '🎪', emoji: '🎪', unlocked: false, earned: false, description: 'Report at a special event' },
    { id: 'b6', name: '100 Club',     icon: '💯', emoji: '💯', unlocked: false, earned: false, description: 'Submit 100 reports' },
    { id: 'b7', name: 'Speed Run',    icon: '⚡', emoji: '⚡', unlocked: false, earned: false, description: 'Report within 1min of arrival' },
    { id: 'b8', name: 'City Expert',  icon: '🗺️', emoji: '🗺️', unlocked: false, earned: false, description: 'Report from 20+ venues' },
  ],
  activityHistory: [
    { id: 'a1', venueName: 'Komodo', minutes: 42, points: 10, ago: '2h ago' },
    { id: 'a2', venueName: 'Vice City Bean', minutes: 10, points: 10, ago: '9h ago' },
    { id: 'a3', venueName: 'Sugar Rooftop', minutes: 55, points: 10, ago: '1d ago' },
    { id: 'a4', venueName: 'Brickell Barber Shop', minutes: 8, points: 10, ago: '2d ago' },
    { id: 'a5', venueName: 'Whole Foods Brickell', minutes: 12, points: 10, ago: '3d ago' },
  ],
  rankTrend: 'up' as 'up' | 'down' | 'flat',
  rankDelta: 5,
  email: 'alex@skiptheline.app',
  phone: '+1 (305) 555-0142',
  joined: 'Mar 2024',
  friends: [
    { id: 'fr1', name: 'Sofía',  handle: '@sofia',  initial: 'S' },
    { id: 'fr2', name: 'Marcus', handle: '@marcus', initial: 'M' },
    { id: 'fr3', name: 'Maya',   handle: '@maya',   initial: 'M' },
    { id: 'fr4', name: 'Theo',   handle: '@theo',   initial: 'T' },
  ],
}

export const categories: { id: Category | 'all'; label: string; emoji: string; sampleWait: number }[] = [
  { id: 'all',           label: 'All',           emoji: '✨', sampleWait: 0 },
  { id: 'restaurants',   label: 'Restaurants',   emoji: '🍽️', sampleWait: 42 },
  { id: 'barbershops',   label: 'Barbershops',   emoji: '💈', sampleWait: 8 },
  { id: 'grocery',       label: 'Grocery',       emoji: '🛒', sampleWait: 12 },
  { id: 'government',    label: 'Government',    emoji: '🏛️', sampleWait: 95 },
  { id: 'healthcare',    label: 'Healthcare',    emoji: '⚕️', sampleWait: 110 },
  { id: 'retail',        label: 'Retail',        emoji: '🛍️', sampleWait: 18 },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', sampleWait: 65 },
  { id: 'landmarks',     label: 'Landmarks',     emoji: '🗽', sampleWait: 30 },
  { id: 'attractions',   label: 'Attractions',   emoji: '🎡', sampleWait: 45 },
]

export function getSeverity(minutes: number): Severity {
  if (minutes <= 15) return 'short'
  if (minutes <= 45) return 'moderate'
  return 'long'
}

export function getWaitColor(severity: Severity | null): string {
  if (!severity) return '#857565'
  if (severity === 'short')    return '#5DB18A'
  if (severity === 'moderate') return '#D69A3F'
  return '#D9462E'
}

export function getWaitLabel(minutes: number): string {
  if (minutes === 0) return 'No wait'
  if (minutes <= 10) return `${minutes}m`
  if (minutes <= 25) return `~${minutes}m`
  return `${minutes}m`
}

export const venuesById: Map<string, Venue> = new Map(venues.map(v => [v.id, v]))

export function severityColor(s: Severity): string {
  if (s === 'short') return '#5DB18A'
  if (s === 'moderate') return '#D69A3F'
  return '#D9462E'
}

export function severityLabel(s: Severity): string {
  if (s === 'short') return 'Short'
  if (s === 'moderate') return 'Moderate'
  return 'Long'
}

export interface Tier {
  id: string; name: string; emoji: string; min: number; max: number; perks: string[]
}
export const tiers: Tier[] = [
  { id: 'scout',   name: 'Scout',   emoji: '🥉', min: 0,    max: 1000,  perks: ['Basic vouchers'] },
  { id: 'ranger',  name: 'Ranger',  emoji: '🥈', min: 1000, max: 2500,  perks: ['2x weekend points'] },
  { id: 'captain', name: 'Captain', emoji: '🥇', min: 2500, max: 5000,  perks: ['Skip-line passes', 'Premium vouchers'] },
  { id: 'legend',  name: 'Legend',  emoji: '👑', min: 5000, max: 10000, perks: ['VIP events', 'Founder badge'] },
]
export function tierFor(points: number): { current: Tier; next?: Tier; progress: number } {
  const current = [...tiers].reverse().find(t => points >= t.min) ?? tiers[0]
  const next = tiers.find(t => t.min > current.min)
  const span = current.max - current.min
  const progress = Math.min(100, Math.max(0, ((points - current.min) / span) * 100))
  return { current, next, progress }
}

export interface Quest {
  id: string; title: string; description: string; reward: number; progress: number; goal: number; emoji: string; type: 'daily' | 'weekly'
}
export const quests: Quest[] = [
  { id: 'q1', title: 'Drop 3 reports today',    description: 'Help your neighborhood stay fresh', reward: 75,  progress: 2,  goal: 3,  emoji: '📍', type: 'daily' },
  { id: 'q2', title: "Confirm a friend's report", description: 'Back up the community',           reward: 25,  progress: 0,  goal: 1,  emoji: '🤝', type: 'daily' },
  { id: 'q3', title: 'Scout a new venue',        description: 'First report on an unmapped spot', reward: 150, progress: 0,  goal: 1,  emoji: '🧭', type: 'weekly' },
  { id: 'q4', title: 'Maintain 14-day streak',   description: 'Two more days to go',              reward: 200, progress: 12, goal: 14, emoji: '🔥', type: 'weekly' },
]

export interface Reward {
  id: string; title: string; brand: string; cost: number; emoji: string; unlocked: boolean
}
export const rewards: Reward[] = [
  { id: 'r1', title: '20% off entrée', brand: "Joe's Stone Crab", cost: 1500, emoji: '🦀', unlocked: true },
  { id: 'r2', title: 'Free fade',      brand: 'LA Barber Co.',    cost: 2000, emoji: '💈', unlocked: true },
  { id: 'r3', title: 'VIP entry',      brand: 'Story Nightclub',  cost: 3500, emoji: '🎟️', unlocked: false },
  { id: 'r4', title: 'Skip-line pass', brand: 'Komodo',           cost: 5000, emoji: '⚡', unlocked: false },
]

export const communityImpact = {
  reportsAllTime: 184,
  peopleHelped: 1240,
  confirmations: 312,
  weeklyXP: 420,
}

export interface Person {
  id: string; name: string; handle: string; initial: string; city: string; reportsCount: number; mutuals: number
}
export const peoplePool: Person[] = [
  { id: 'p1', name: 'Jasmine K.', handle: '@jasmine', initial: 'J', city: 'Wynwood',      reportsCount: 412, mutuals: 4 },
  { id: 'p2', name: 'Rico M.',    handle: '@ricom',   initial: 'R', city: 'Brickell',     reportsCount: 318, mutuals: 3 },
  { id: 'p3', name: 'Priya S.',   handle: '@priyas',  initial: 'P', city: 'Midtown',      reportsCount: 287, mutuals: 2 },
  { id: 'p4', name: 'Devon W.',   handle: '@devon',   initial: 'D', city: 'South Beach',  reportsCount: 196, mutuals: 5 },
  { id: 'p5', name: 'Aisha N.',   handle: '@aishan',  initial: 'A', city: 'Coral Gables', reportsCount: 154, mutuals: 1 },
  { id: 'p6', name: 'Tyler B.',   handle: '@tylerb',  initial: 'T', city: 'Wynwood',      reportsCount: 132, mutuals: 3 },
  { id: 'p7', name: 'Nina B.',    handle: '@ninab',   initial: 'N', city: 'Edgewater',    reportsCount: 98,  mutuals: 0 },
]
export const incomingRequests: Person[] = [
  { id: 'ir1', name: 'Liam O.', handle: '@liamo', initial: 'L', city: 'Brickell', reportsCount: 41, mutuals: 2 },
  { id: 'ir2', name: 'Zoe P.',  handle: '@zoep',  initial: 'Z', city: 'Midtown',  reportsCount: 22, mutuals: 1 },
]
