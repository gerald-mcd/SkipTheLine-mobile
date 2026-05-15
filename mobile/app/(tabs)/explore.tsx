import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, font } from '../../constants/theme'
import { getWaitColor } from '../../lib/mock-data'

type FeedItem =
  | { id: string; kind: 'drop'; ago: string; venueId: string; from: number; to: number }
  | { id: string; kind: 'report'; ago: string; venueId: string; user: string; initial: string; minutes: number; quote?: string }
  | { id: string; kind: 'venue'; ago: string; venueId: string }
  | { id: string; kind: 'system'; ago: string; title: string; body: string; emoji: string }

import { venues } from '../../lib/mock-data'

const venuesById = new Map(venues.map(v => [v.id, v]))

const exploreFeed: FeedItem[] = [
  { id: 'fd1', kind: 'drop', ago: 'now', venueId: 'v5', from: 40, to: 25 },
  { id: 'fd2', kind: 'report', ago: '1m', venueId: 'v1', user: 'Sofía', initial: 'S', minutes: 42, quote: 'Seated in 38 — bar moves faster.' },
  { id: 'fd3', kind: 'venue', ago: '2m', venueId: 'v2' },
  { id: 'fd4', kind: 'system', ago: '3m', title: '+25 SkipPoints', body: 'Your report at Coyo Taco was confirmed by 4 people.', emoji: '✨' },
  { id: 'fd5', kind: 'report', ago: '4m', venueId: 'v3', user: 'Marcus', initial: 'M', minutes: 8, quote: 'Walked right in. Chair open.' },
  { id: 'fd6', kind: 'system', ago: '12m', title: 'Badge earned: Night Owl', body: 'Reported 5 venues after 11pm this week.', emoji: '🦉' },
]

type Filter = 'all' | 'drops' | 'reports' | 'venues' | 'system'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'drops', label: 'Wait drops' },
  { id: 'reports', label: 'Reports' },
  { id: 'venues', label: 'Venues' },
  { id: 'system', label: 'You' },
]

export default function ExploreScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('all')

  const items = useMemo(() => {
    if (filter === 'all') return exploreFeed
    const map: Record<Exclude<Filter, 'all'>, FeedItem['kind']> = {
      drops: 'drop', reports: 'report', venues: 'venue', system: 'system',
    }
    return exploreFeed.filter(i => i.kind === map[filter])
  }, [filter])

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LIVE ACTIVITY · MIAMI</Text>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>What's moving right now — drops, reports, and updates.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                {FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                    onPress={() => setFilter(f.id)}
                  >
                    <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FeedCard item={item} onVenuePress={id => router.push(`/venue/${id}`)} />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  )
}

function FeedCard({ item, onVenuePress }: { item: FeedItem; onVenuePress: (id: string) => void }) {
  const venue = item.kind !== 'system' ? venuesById.get(item.venueId) : undefined

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderLabel}>
          {item.kind === 'drop' ? '📉 Wait drop'
            : item.kind === 'report' ? '🕐 Live report'
            : item.kind === 'venue' ? `👥 ${venue?.liveReporters ?? 0} live now`
            : '✨ For you'}
        </Text>
        <Text style={styles.cardHeaderAgo}>{item.ago}</Text>
      </View>

      {/* Drop */}
      {item.kind === 'drop' && venue && (
        <TouchableOpacity style={styles.dropCard} onPress={() => onVenuePress(venue.id)} activeOpacity={0.85}>
          <View style={[styles.dropIcon, { backgroundColor: colors.waitShort }]}>
            <Text style={styles.dropIconText}>↘</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dropTitle}>{venue.name} just dropped</Text>
            <Text style={styles.dropSub}>
              <Text style={styles.strikethrough}>{item.from}m</Text>
              {'  →  '}
              <Text style={styles.dropNew}>{item.to}m wait</Text>
              {'  ·  '}{venue.distance}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Report */}
      {item.kind === 'report' && venue && (
        <TouchableOpacity style={styles.reportRow} onPress={() => onVenuePress(venue.id)} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportText}>
              <Text style={{ fontWeight: '700' }}>{item.user}</Text>
              <Text style={{ color: colors.textMuted }}> reported </Text>
              <Text style={{ fontWeight: '700' }}>{item.minutes}m</Text>
              <Text style={{ color: colors.textMuted }}> at </Text>
              <Text style={{ fontWeight: '700' }}>{venue.name}</Text>
            </Text>
            {item.quote && <Text style={styles.reportQuote}>"{item.quote}"</Text>}
          </View>
          <View style={[styles.miniWait, { backgroundColor: getWaitColor(venue.severity) }]}>
            <Text style={styles.miniWaitText}>{item.minutes}m</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Venue card */}
      {item.kind === 'venue' && venue && (
        <TouchableOpacity onPress={() => onVenuePress(venue.id)} activeOpacity={0.88}>
          <View style={styles.venueHero}>
            <Image source={{ uri: venue.image }} style={styles.venueHeroImg} resizeMode="cover" />
            <View style={styles.venueHeroOverlay} />
            <View style={[styles.venueWaitPill, { backgroundColor: getWaitColor(venue.severity) }]}>
              <Text style={styles.venueWaitPillText}>{venue.waitMinutes}m wait</Text>
            </View>
            <View style={styles.venueHeroBottom}>
              <Text style={styles.venueHeroLabel}>{venue.categoryLabel} · {venue.distance}</Text>
              <Text style={styles.venueHeroName}>{venue.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* System */}
      {item.kind === 'system' && (
        <View style={styles.systemCard}>
          <Text style={styles.systemEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.systemTitle}>{item.title}</Text>
            <Text style={styles.systemBody}>{item.body}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: { fontSize: 36, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  subtitle: { fontSize: font.sm, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  filterScroll: { marginTop: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  filterChipText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: colors.background },
  listContent: { paddingHorizontal: spacing.md, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 4,
  },
  cardHeaderLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.5 },
  cardHeaderAgo: { fontSize: 10, color: colors.textMuted },
  // Drop
  dropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(52,199,89,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.25)',
    marginBottom: spacing.sm,
  },
  dropIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropIconText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  dropTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  dropSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through' },
  dropNew: { fontWeight: '700', color: colors.text },
  // Report
  reportRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '700', fontSize: font.sm },
  reportText: { fontSize: 13, color: colors.text, lineHeight: 18 },
  reportQuote: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginTop: 3 },
  miniWait: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  miniWaitText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  // Venue
  venueHero: { height: 200, position: 'relative' },
  venueHeroImg: { width: '100%', height: '100%' },
  venueHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  venueWaitPill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  venueWaitPillText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  venueHeroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  venueHeroLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  venueHeroName: { fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
  // System
  systemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    margin: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(108,71,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108,71,255,0.25)',
    marginBottom: spacing.sm,
  },
  systemEmoji: { fontSize: 24 },
  systemTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  systemBody: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
