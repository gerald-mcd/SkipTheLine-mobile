import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Moon, Sun, Settings, Search, Heart, SlidersHorizontal, X, Clock, Users, BarChart2, Calendar, Shield, Download, ChevronRight } from 'lucide-react-native'
import { spacing, fontFamily } from '@/constants/theme'
import { categories, type Category, getSeverity, getWaitColor } from '@/lib/mock-data'
import { OnboardingTour } from '@/components/OnboardingTour'
import { useThemeStore, useColors } from '@/lib/theme-store'
import { getLaunchedVenues, toggleFavorite, getFavoriteIds, type Venue } from '@/lib/queries'
import { supabase } from '@/lib/supabase'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2

const PAGE_SIZE = 20

// ─── Premium Pass teaser ──────────────────────────────────────────────────────

const P_FEATURES = [
  { icon: <Clock size={12} color="#F8682B" strokeWidth={2} />,      label: 'Wait intel'       },
  { icon: <Users size={12} color="#F8682B" strokeWidth={2} />,      label: 'Foot traffic'     },
  { icon: <BarChart2 size={12} color="#F8682B" strokeWidth={2} />,  label: 'Competitor pulse' },
  { icon: <Calendar size={12} color="#F8682B" strokeWidth={2} />,   label: 'Event lift'       },
  { icon: <Shield size={12} color="#F8682B" strokeWidth={2} />,     label: 'Reporter quality' },
  { icon: <Download size={12} color="#F8682B" strokeWidth={2} />,   label: 'CSV exports'      },
]

function PremiumTeaser({ onPress }: { onPress: () => void }) {
  const c = useColors()

  // Token mixes per spec
  // primary 6% over card  → rgba(248,104,43,0.06) blended on white
  const primaryTint6  = 'rgba(248,104,43,0.06)'
  const primaryTint12 = 'rgba(248,104,43,0.12)'
  const primaryTint14 = 'rgba(248,104,43,0.14)'

  return (
    <Pressable
      style={({ pressed }) => [
        prem.wrap,
        pressed && { transform: [{ scale: 0.99 }, { translateY: 1 }] },
      ]}
      onPress={onPress}
    >
      {/* Card with very subtle gradient wash — barely perceptible sheen */}
      <LinearGradient
        colors={[
          'rgba(248,104,43,0.03)',   // primary 3% tint top-left
          c.card,                    // card color mid
          'rgba(242,147,77,0.02)',   // primary-glow 2% tint bottom-right
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[prem.card, { borderColor: c.border }]}
      >
        {/* Glow blob — top-right, blur-2xl, primary 35% opacity 0.6 */}
        <View style={prem.glowBlob} pointerEvents="none" />

        {/* Header row — flex items-start gap-3 */}
        <View style={prem.headerRow}>

          {/* Icon tile — h-11 w-11 (44), rounded-2xl (22), gradient-aurora, shadow-glow */}
          <LinearGradient
            colors={['#F8682B', '#F2934D']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={prem.iconTile}
          >
            <Text style={prem.iconGlyph}>◆</Text>
          </LinearGradient>

          {/* Text stack */}
          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Pill badge */}
            <View style={[prem.badge, { backgroundColor: primaryTint14 }]}>
              <Text style={prem.badgeText}>PREMIUM · FOR OWNERS</Text>
            </View>
            {/* Title */}
            <Text style={[prem.title, { color: c.foreground }]}>
              Turn your line into your edge.
            </Text>
            {/* Subtitle */}
            <Text style={[prem.sub, { color: c.mutedForeground }]}>
              The full analytics suite, built from live SkipTheLine signals.
            </Text>
          </View>

          {/* Chevron */}
          <ChevronRight size={16} color={c.mutedForeground} strokeWidth={2} style={{ marginTop: 4 }} />
        </View>

        {/* Feature grid — 3 cols, gap 6 */}
        <View style={prem.featGrid}>
          {P_FEATURES.map(f => (
            <View
              key={f.label}
              style={[prem.featChip, {
                backgroundColor: primaryTint6,
                borderColor: primaryTint12,
              }]}
            >
              {f.icon}
              <Text style={[prem.featLabel, { color: c.foreground }]} numberOfLines={1}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer row */}
        <View style={prem.footer}>
          <Text style={[prem.footerCaption, { color: c.mutedForeground }]}>
            From <Text style={{ fontWeight: '700', color: c.foreground }}>$29/mo</Text>
            {' '}· No card to preview
          </Text>
          <View style={prem.ctaBtn}>
            <Text style={prem.ctaText}>Preview suite</Text>
          </View>
        </View>

      </LinearGradient>
    </Pressable>
  )
}

const prem = StyleSheet.create({
  // outer pressable wrapper
  wrap: { marginHorizontal: 20, marginTop: 12, marginBottom: 16 },

  // rounded-3xl (26), p-4 (16), border, shadow-md, overflow hidden
  card: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // glow blob — top:-48 right:-48, 144×144, blur simulated via shadow + low opacity
  glowBlob: {
    position: 'absolute',
    top: -48, right: -48,
    width: 144, height: 144,
    borderRadius: 9999,
    backgroundColor: 'rgba(248,104,43,0.12)',
    opacity: 0.5,
  },

  // header row — flex items-start gap-3
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  // icon tile — h-11 w-11 (44), rounded-2xl (22), shadow-glow
  iconTile: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
    shadowColor: '#F8682B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 5,
  },
  iconGlyph: { fontSize: 20, color: '#FFFFFF' },

  // badge — px-1.5 py-0.5, rounded-full, text-[9px] bold uppercase tracking
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 6, paddingVertical: 2,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9, fontWeight: '700', color: '#F8682B',
    letterSpacing: 1.4, textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },

  // title — text-[15px] bold leading-tight tracking-tight mt-1
  title: {
    fontSize: 15, fontWeight: '700',
    lineHeight: 20, letterSpacing: -0.3,
    fontFamily: fontFamily.display,
    marginTop: 2, marginBottom: 2,
  },

  // subtitle — text-[11.5px] muted mt-0.5
  sub: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: fontFamily.body,
  },

  // feature grid — 3 cols, gap 6
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // chip — rounded-xl (14), px-1.5 py-1.5 (6), flex items-center gap-1, border
  featChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 6,
    flexBasis: '30%', flexGrow: 1,
  },
  featLabel: {
    fontSize: 10, fontWeight: '600',
    fontFamily: fontFamily.bodySemiBold,
    flexShrink: 1,
  },

  // footer row
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  footerCaption: { fontSize: 10.5, fontFamily: fontFamily.body, flex: 1 },

  // CTA pill — rounded-full, px-3 py-1.5, shadow-glow
  ctaBtn: {
    borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#F8682B',
    shadowColor: '#F8682B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', fontFamily: fontFamily.display },
})

const featuredExperiences = [
  {
    id: 'fe0',
    title: 'Miami Bayside Walkway',
    type: 'Experience',
    distance: '1.1 mi',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
    sponsored: false,
  },
  {
    id: 'fe1',
    title: 'Brickell Key Sunset Loop',
    type: 'Landmark',
    distance: '0.7 mi',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    sponsored: true,
  },
  {
    id: 'fe2',
    title: 'Wynwood Art Walk',
    type: 'Art',
    distance: '2.3 mi',
    price: '$10',
    image: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800&q=80',
    sponsored: true,
  },
]

// ─── Wait pill ────────────────────────────────────────────────────────────────
function WaitPill({ minutes }: { minutes: number }) {
  const severity = getSeverity(minutes)
  const bgColor = getWaitColor(severity)
  return (
    <View style={{ borderRadius: 999, overflow: 'hidden' }}>
      <LinearGradient
        colors={[bgColor, bgColor]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}
      >
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.2 }}>
          {minutes} min
        </Text>
      </LinearGradient>
    </View>
  )
}

// ─── Featured carousel ────────────────────────────────────────────────────────
function FeaturedCarousel({ onViewPress }: { onViewPress?: () => void }) {
  const c = useColors()
  const [activeIndex, setActiveIndex] = useState(1)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: activeIndex * CARD_WIDTH, animated: false })
    }, 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % featuredExperiences.length
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true })
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <View style={featStyles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH)
          setActiveIndex(idx)
        }}
        style={{ width: CARD_WIDTH, marginHorizontal: spacing.md }}
      >
        {featuredExperiences.map((item) => (
          <View key={item.id} style={[featStyles.card, { width: CARD_WIDTH, backgroundColor: c.card, borderColor: c.border }]}>
            <View style={featStyles.imageWrapper}>
              <Image source={{ uri: item.image }} style={featStyles.image} resizeMode="cover" />
              {item.sponsored ? (
                <View style={featStyles.badgeLeft}>
                  <Text style={featStyles.badgeText}>SPONSORED</Text>
                </View>
              ) : null}
              <View style={featStyles.badgeRight}>
                <Text style={featStyles.badgeText}>FEATURED EXPERIENCE</Text>
              </View>
            </View>
            <View style={[featStyles.info, { backgroundColor: c.card }]}>
              <View style={{ flex: 1 }}>
                <Text style={[featStyles.title, { color: c.foreground }]}>{item.title}</Text>
                <Text style={[featStyles.subtitle, { color: c.mutedForeground }]}>{item.type} · {item.distance} · {item.price}</Text>
              </View>
              <Pressable style={featStyles.viewBtn} onPress={onViewPress}>
                <Text style={featStyles.viewBtnText}>View</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={featStyles.dots}>
        {featuredExperiences.map((_, i) => (
          <View
            key={i}
            style={[featStyles.dot, i === activeIndex ? featStyles.dotActive : featStyles.dotInactive]}
          />
        ))}
      </View>
    </View>
  )
}

const featStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageWrapper: { position: 'relative', height: 200 },
  image: { width: '100%', height: 200 },
  badgeLeft: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(25,20,15,0.78)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999,
  },
  badgeRight: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(25,20,15,0.78)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.4, fontFamily: fontFamily.accent },
  info: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  title: { fontSize: 16, fontWeight: '700', fontFamily: fontFamily.display },
  subtitle: { fontSize: 12, marginTop: 2, fontFamily: fontFamily.body },
  viewBtn: {
    borderWidth: 1.5, borderColor: '#F8682B',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(224,122,59,0.08)',
  },
  viewBtnText: { color: '#F8682B', fontSize: 13, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },
  dots: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 12,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: '#F8682B' },
  dotInactive: { width: 6, backgroundColor: '#C5BDB4' },
})

// ─── Category chips ───────────────────────────────────────────────────────────
function CategoryChips({
  active,
  onChange,
}: {
  active: Category | 'all'
  onChange: (c: Category | 'all') => void
}) {
  const c = useColors()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.row}
      style={{ flexGrow: 0 }}
    >
      {categories.map((cat) => {
        const on = cat.id === active
        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={[chipStyles.chip, { backgroundColor: on ? '#F8682B' : c.card, borderColor: '#F8682B' }]}
          >
            <View style={chipStyles.chipInner}>
              <Text style={[chipStyles.label, { color: on ? '#fff' : '#F8682B' }]}>{cat.label}</Text>
            </View>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const chipStyles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: 8, paddingBottom: 4 },
  chip: { borderRadius: 9999, borderWidth: 1.5 },
  chipGradient: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  chipInner: { paddingHorizontal: 16, paddingVertical: 8 },
  label: { fontSize: 13, fontWeight: '600' },
})

// Category stock photos — same images as welcome screen slides
const CATEGORY_PHOTOS: Record<string, string> = {
  restaurants:   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
  barbershops:   'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop',
  grocery:       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop',
  government:    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80&auto=format&fit=crop',
  healthcare:    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80&auto=format&fit=crop',
  retail:        'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop',
  entertainment: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80&auto=format&fit=crop',
  landmarks:     'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800&q=80&auto=format&fit=crop',
  attractions:   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop',
}

// ─── Venue card ───────────────────────────────────────────────────────────────
function VenueCard({
  venue,
  liked,
  onToggleLike,
  onPress,
}: {
  venue: Venue
  liked: boolean
  onToggleLike: () => void
  onPress: () => void
}) {
  const c = useColors()
  const venueCardWidth = (SCREEN_WIDTH - 20 * 2 - 12) / 2
  const photoUrl = venue.primary_image_url ?? CATEGORY_PHOTOS[venue.category]
  const hasWait = venue.current_wait_minutes > 0 || venue.reports_count > 0

  return (
    <Pressable
      style={[cardStyles.card, { width: venueCardWidth, backgroundColor: c.card, borderColor: c.border }]}
      onPress={onPress}
      testID={`venue-card-${venue.id}`}
    >
      <View style={cardStyles.imageWrapper}>
        {/* Always show an image — real photo or category stock photo */}
        <Image
          source={{ uri: photoUrl ?? '' }}
          style={cardStyles.image}
          resizeMode="cover"
        />
        <Pressable style={cardStyles.heart} onPress={onToggleLike} testID={`heart-${venue.id}`}>
          <Heart
            size={13}
            color={liked ? c.primary : '#555'}
            fill={liked ? c.primary : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
        {/* First to report banner — shown when no wait time exists yet */}
        {!hasWait ? (
          <View style={cardStyles.firstReportBanner}>
            <Text style={cardStyles.firstReportText}>⟫ Be first to report · +15 pts</Text>
          </View>
        ) : null}
      </View>
      <View style={cardStyles.body}>
        <Text style={[cardStyles.name, { color: c.foreground }]} numberOfLines={1}>{venue.name}</Text>
        <View style={cardStyles.metaRow}>
          <Text style={[cardStyles.meta, { color: c.mutedForeground }]} numberOfLines={1}>
            {venue.live_reporters > 0 ? `${venue.live_reporters} live · ` : ''}{venue.neighborhood ?? venue.city}
          </Text>
          {hasWait ? (
            <WaitPill minutes={venue.current_wait_minutes} />
          ) : (
            <View style={cardStyles.noWaitPill}>
              <Text style={cardStyles.noWaitText}>–</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

const cardStyles = StyleSheet.create({
  // Standard card: rounded-2xl (22px), shadow-sm, 1px border
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageWrapper: { position: 'relative', height: 130 },
  image: { width: '100%', height: 130 },
  heart: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10, shadowRadius: 3, elevation: 2,
  },
  firstReportBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#F8682B',
    paddingVertical: 5, paddingHorizontal: 8, alignItems: 'center',
  },
  firstReportText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },
  // p-4 (16px) body padding per spec
  body: { padding: 16 },
  // title: text-sm (14px), weight 600
  name: { fontSize: 14, fontWeight: '600', marginBottom: 6, fontFamily: fontFamily.display },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 4,
  },
  // meta: text-[11px], weight 400, muted
  meta: { fontSize: 11, flex: 1, fontFamily: fontFamily.body },
  noWaitPill: {
    borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4,
    backgroundColor: '#EDE6DD',
  },
  noWaitText: { fontSize: 10, fontWeight: '700', color: '#857565' },
})

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const c = useColors()
  const isDark = useThemeStore(s => s.isDark)
  const toggleTheme = useThemeStore(s => s.toggle)
  const hydrateTheme = useThemeStore(s => s.hydrate)

  const [cat, setCat] = useState<Category | 'all'>('all')
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [tourVisible, setTourVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showShortWaitsOnly, setShowShortWaitsOnly] = useState(false)
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    hydrateTheme()
    loadVenues()
    loadUser()
  }, [])

  async function loadVenues() {
    const data = await getLaunchedVenues()
    setAllVenues(data)
  }

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const favIds = await getFavoriteIds(user.id)
    setLiked(new Set(favIds))
  }

  function handleCatChange(newCat: Category | 'all') {
    setCat(newCat)
    setVisibleCount(PAGE_SIZE)
  }

  async function toggleLike(venueId: string) {
    const isFav = liked.has(venueId)
    setLiked(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(venueId)
      else next.add(venueId)
      return next
    })
    if (userId) await toggleFavorite(userId, venueId, isFav)
  }

  const filtered = useMemo(() => {
    let list = allVenues.filter(v => cat === 'all' || v.category === cat)
    if (showShortWaitsOnly) list = list.filter(v => v.current_wait_minutes <= 15)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.category_label?.toLowerCase().includes(q))
    }
    return list
  }, [allVenues, cat, searchQuery, showShortWaitsOnly])

  const rankColor = c.mutedForeground

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.background }]} testID="home-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarWrap, styles.avatar]}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <Text style={[styles.greeting, { color: c.foreground }]}>Hi there!</Text>
            <View style={[styles.rankBadge, { backgroundColor: `${rankColor}22` }]}>
              <Text style={[styles.rankText, { color: rankColor }]}>#–</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={toggleTheme}
              testID="dark-mode-toggle"
            >
              {isDark ? (
                <Sun size={16} color={c.primary} />
              ) : (
                <Moon size={16} color={c.foreground} />
              )}
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Settings size={16} color={c.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Featured carousel */}
        <FeaturedCarousel onViewPress={() => router.push('/(tabs)/discover')} />

        {/* Premium Pass teaser */}
        <PremiumTeaser onPress={() => router.push('/premium' as any)} />

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
            <Search size={16} color={c.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: c.foreground }]}
              placeholder="Search venues, food, vibes..."
              placeholderTextColor={c.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="home-search-input"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={14} color={c.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={[styles.filterBtn, { backgroundColor: showShortWaitsOnly ? c.foreground : '#F8682B' }]}
            onPress={() => setShowShortWaitsOnly(prev => !prev)}
          >
            <SlidersHorizontal size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Categories</Text>
          <Pressable onPress={() => router.push('/(tabs)/discover')}>
            <Text style={[styles.seeAll, { color: c.primary }]}>See all</Text>
          </Pressable>
        </View>
        <CategoryChips active={cat} onChange={handleCatChange} />

        {/* Around you */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>Around you</Text>
            <Text style={[styles.sortHint, { color: c.mutedForeground }]}>
              {'Sorted by '}
              <Text style={[styles.sortHintBold, { color: c.foreground }]}>trending</Text>
            </Text>
          </View>
        </View>

        {/* 2-col venue grid — paginated */}
        <View style={styles.grid}>
          {filtered.slice(0, visibleCount).map((v) => (
            <VenueCard
              key={v.id}
              venue={v}
              liked={liked.has(v.id)}
              onToggleLike={() => toggleLike(v.id)}
              onPress={() => router.push(`/venue/${v.id}`)}
            />
          ))}
        </View>

        {/* Show more button */}
        {visibleCount < filtered.length && (
          <Pressable
            style={styles.showMoreBtn}
            onPress={() => setVisibleCount(c => c + PAGE_SIZE)}
          >
            <Text style={styles.showMoreText}>
              Show more · {filtered.length - visibleCount} remaining
            </Text>
          </Pressable>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <OnboardingTour
        visible={tourVisible}
        onDismiss={() => setTourVisible(false)}
      />

    </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F8682B',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {},
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: fontFamily.displayBold },
  greeting: { fontSize: 15, fontWeight: '700', fontFamily: fontFamily.display },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4,
  },
  rankText: { fontSize: 12, fontWeight: '700' },
  rankDelta: { fontSize: 12, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.md, marginBottom: 20, marginTop: 16,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 9999,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(99,102,241,1)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  filterGradient: {
    flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, fontFamily: fontFamily.display },
  seeAll: { fontSize: 13, fontWeight: '600' },
  sortHint: { fontSize: 12, marginTop: 2 },
  sortHintBold: { fontWeight: '700' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 12,
  },
  showMoreBtn: {
    marginHorizontal: spacing.md, marginTop: 16, marginBottom: 4,
    paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#EDE6DD',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  showMoreText: {
    fontSize: 13, fontWeight: '600', color: '#F8682B',
    fontFamily: 'Inter_600SemiBold',
  },
})
