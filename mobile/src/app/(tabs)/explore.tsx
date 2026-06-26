import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowDownRight } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { exploreFeed, type FeedItem } from '@/lib/mock-data'
import { getLaunchedVenues, type Venue } from '@/lib/queries'
import { fontFamily } from '@/constants/theme'
import WaitBadge from '@/components/WaitBadge'

const COLORS = {
  background: '#FCFBF9',
  foreground: '#33384A',
  mutedForeground: '#857565',
  card: '#FFFFFF',
  border: '#EDE6DD',
  primary: '#F8682B',
  success: '#5DB18A',
  destructive: '#D9462E',
}

type Filter = 'all' | 'drops' | 'reports' | 'venues' | 'system'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'drops', label: 'Wait drops' },
  { id: 'reports', label: 'Reports' },
  { id: 'venues', label: 'Venues' },
  { id: 'system', label: 'You' },
]

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]))
    loop.start()
    return () => loop.stop()
  }, [scale, opacity])
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success, transform: [{ scale }], opacity }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success }} />
    </View>
  )
}

function FeedCard({ item, venuesMap, venuesList, cardIndex }: {
  item: FeedItem
  venuesMap: Map<string, Venue>
  venuesList: Venue[]
  cardIndex: number
}) {
  const router = useRouter()
  // Try real DB lookup first; if not found (mock ID), pick a real venue by position
  const realVenue = item.kind !== 'system' ? venuesMap.get((item as any).venueId) : undefined
  const venue = realVenue ?? (item.kind !== 'system' && venuesList.length > 0
    ? venuesList[cardIndex % venuesList.length]
    : undefined)

  if (item.kind === 'drop') {
    return (
      <Pressable
        style={cardStyles.card}
        onPress={venue ? () => router.push({ pathname: '/venue/[id]', params: { id: venue.id } }) : undefined}
      >
        <View style={cardStyles.dropHeader}>
          <View style={cardStyles.dropIconWrap}>
            <ArrowDownRight size={16} color={COLORS.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cardStyles.dropTitle}>
              Wait dropped at <Text style={cardStyles.venueName}>{venue?.name ?? item.venueId}</Text>
            </Text>
            <Text style={cardStyles.ago}>{item.ago}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <WaitBadge minutes={item.to} size="sm" variant="solid" />
            <Text style={cardStyles.fromWait}>{item.from}m → {item.to}m</Text>
          </View>
        </View>
        {venue?.primary_image_url ? (
          <View style={cardStyles.imageWrap}>
            <Image source={{ uri: venue.primary_image_url }} style={cardStyles.image} resizeMode="cover" />
          </View>
        ) : null}
      </Pressable>
    )
  }

  if (item.kind === 'report') {
    const isFriend = false // friends wired in Phase 2
    const displayName = isFriend ? item.user : 'Someone nearby'
    const waitColor = item.minutes <= 15 ? COLORS.success : item.minutes <= 45 ? '#D69A3F' : COLORS.destructive
    return (
      <Pressable
        style={cardStyles.card}
        onPress={venue ? () => router.push({ pathname: '/venue/[id]', params: { id: venue.id } }) : undefined}
      >
        <View style={cardStyles.reportHeader}>
          <View style={[cardStyles.reportAvatar, { backgroundColor: `${waitColor}22` }]}>
            <Text style={[cardStyles.reportInitial, { color: waitColor }]}>{item.initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cardStyles.reportText}>
              <Text style={cardStyles.reportUser}>{displayName}</Text>
              {' reported '}
              <Text style={cardStyles.reportBold}>{item.minutes}m</Text>
              {' at '}
              <Text style={cardStyles.venueName}>{venue?.name ?? item.venueId}</Text>
            </Text>
            <Text style={cardStyles.ago}>{item.ago}</Text>
          </View>
          <WaitBadge minutes={item.minutes} size="sm" variant="pill" />
        </View>
        {item.quote ? (
          <View style={cardStyles.quoteWrap}>
            <Text style={cardStyles.quote}>"{item.quote}"</Text>
          </View>
        ) : null}
      </Pressable>
    )
  }

  if (item.kind === 'venue' && venue) {
    return (
      <Pressable
        style={cardStyles.card}
        onPress={() => router.push({ pathname: '/venue/[id]', params: { id: venue.id } })}
      >
        <View style={cardStyles.imageWrap}>
          <Image source={{ uri: venue.primary_image_url ?? '' }} style={cardStyles.venueImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={cardStyles.venueOverlay}>
            <Text style={cardStyles.venueCat}>{venue.category_label}{venue.vibe ? ` · ${venue.vibe}` : ''}</Text>
            <Text style={cardStyles.venueNameLg}>{venue.name}</Text>
            <Text style={cardStyles.venueReporters}>{venue.live_reporters} live · {venue.neighborhood ?? venue.city}</Text>
          </View>
          <View style={cardStyles.venueBadge}>
            <WaitBadge minutes={venue.current_wait_minutes} size="md" variant="solid" />
          </View>
        </View>
        <Text style={cardStyles.venueAgo}>{item.ago}</Text>
      </Pressable>
    )
  }

  if (item.kind === 'system') {
    return (
      <View style={[cardStyles.card, cardStyles.systemCard]}>
        <View style={cardStyles.systemEmoji}>
          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.systemTitle}>{item.title}</Text>
          <Text style={cardStyles.systemBody}>{item.body}</Text>
          <Text style={cardStyles.ago}>{item.ago}</Text>
        </View>
      </View>
    )
  }

  return null
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dropHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  dropIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: `${COLORS.success}18`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dropTitle: { fontSize: 13, color: COLORS.foreground },
  fromWait: { fontSize: 10, color: COLORS.mutedForeground },

  reportHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  reportAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reportInitial: { fontSize: 14, fontWeight: '700' },
  reportText: { fontSize: 13, color: COLORS.foreground, lineHeight: 18 },
  reportUser: { fontWeight: '700' },
  reportBold: { fontWeight: '700' },

  quoteWrap: { marginHorizontal: 14, marginBottom: 14, backgroundColor: '#F7F2EC', borderRadius: 10, padding: 10 },
  quote: { fontSize: 12, color: COLORS.mutedForeground, fontStyle: 'italic', lineHeight: 18 },

  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 140 },
  venueImage: { width: '100%', height: 200 },
  venueOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  venueCat: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.8 },
  venueNameLg: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3, marginTop: 2 },
  venueReporters: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  venueBadge: { position: 'absolute', top: 12, right: 12 },
  venueAgo: { fontSize: 11, color: COLORS.mutedForeground, padding: 10, paddingTop: 8 },

  systemCard: { flexDirection: 'row', gap: 12, padding: 14 },
  systemEmoji: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  systemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  systemBody: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2, lineHeight: 17 },

  venueName: { fontWeight: '600', color: COLORS.foreground },
  ago: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 3 },
})

export default function ExploreScreen() {
  const [filter, setFilter] = useState<Filter>('all')
  const [realVenuesById, setRealVenuesById] = useState<Map<string, Venue>>(new Map())
  const [realVenuesList, setRealVenuesList] = useState<Venue[]>([])

  useEffect(() => {
    getLaunchedVenues().then(venues => {
      setRealVenuesList(venues)
      const map = new Map(venues.map(v => [v.id, v]))
      setRealVenuesById(map)
    })
  }, [])

  const items = useMemo(() => {
    if (filter === 'all') return exploreFeed
    const map: Record<Exclude<Filter, 'all'>, FeedItem['kind']> = {
      drops: 'drop', reports: 'report', venues: 'venue', system: 'system',
    }
    return exploreFeed.filter(i => i.kind === map[filter])
  }, [filter])

  return (
    <SafeAreaView edges={['top']} style={styles.safe} testID="explore-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Live activity · Miami</Text>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>What's moving right now — drops, reports, and updates.</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterRow, { flexGrow: 0 }]}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {FILTERS.map(f => {
            const active = filter === f.id
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                testID={`filter-${f.id}`}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <View style={styles.feed}>
          {items.map((item, idx) => (
            <FeedCard
              key={item.id}
              item={item}
              venuesMap={realVenuesById}
              venuesList={realVenuesList}
              cardIndex={idx}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  eyebrow: { fontSize: 10, fontWeight: '700', color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: fontFamily.accent },
  title: { fontSize: 36, fontWeight: '700', color: COLORS.foreground, letterSpacing: -1, lineHeight: 40, marginTop: 2, fontFamily: fontFamily.displayBold },
  subtitle: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 6, marginBottom: 16, lineHeight: 18, fontFamily: fontFamily.body },
  filterRow: { marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.foreground, borderColor: COLORS.foreground },
  filterLabel: { fontSize: 11, fontWeight: '600', color: COLORS.mutedForeground, fontFamily: fontFamily.bodySemiBold },
  filterLabelActive: { color: COLORS.background },
  feed: { gap: 12 },
})
