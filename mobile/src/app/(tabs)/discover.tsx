import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput,
  Animated, PanResponder, Dimensions, StatusBar,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Search, MapPin, Users, SlidersHorizontal } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { venues, getSeverity, getWaitColor } from '@/lib/mock-data'
import { fontFamily } from '@/constants/theme'

const { height: SCREEN_H } = Dimensions.get('window')

const C = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  border: '#EDE6DD',
  fg: '#33384A',
  muted: '#857565',
  primary: '#F8682B',
  primaryGlow: '#F2934D',
}

// Sheet snap points (from bottom)
const SNAP_PEEK = 100        // just the handle + count
const SNAP_HALF = SCREEN_H * 0.6
const SNAP_FULL = SCREEN_H * 0.92

const MAP_PINS = [
  { top: '22%', left: '18%', wait: 8, color: '#5DB18A', label: 'Whole Foods' },
  { top: '42%', left: '58%', wait: 55, color: '#D9462E', label: 'Sugar Rooftop' },
  { top: '30%', left: '72%', wait: 42, color: '#E07A3B', label: 'Komodo' },
  { top: '60%', left: '25%', wait: 12, color: '#5DB18A', label: 'Zuma' },
  { top: '50%', left: '45%', wait: 28, color: '#D69A3F', label: 'Truluck\'s' },
  { top: '35%', left: '38%', wait: 65, color: '#D9462E', label: 'LIV' },
]

export default function DiscoverScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')

  const filtered = venues
    .filter(v => !search.trim() || v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.liveReporters - a.liveReporters)

  // Sheet animation
  const sheetY = useRef(new Animated.Value(SCREEN_H - SNAP_HALF)).current
  const lastY = useRef(SCREEN_H - SNAP_HALF)

  function snapTo(target: number) {
    lastY.current = target
    Animated.spring(sheetY, { toValue: target, damping: 22, stiffness: 180, mass: 1, useNativeDriver: true }).start()
  }

  useEffect(() => {
    snapTo(SCREEN_H - SNAP_HALF)
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        sheetY.stopAnimation()
      },
      onPanResponderMove: (_, g) => {
        const next = lastY.current + g.dy
        if (next >= SCREEN_H - SNAP_FULL && next <= SCREEN_H - SNAP_PEEK) {
          sheetY.setValue(next)
        }
      },
      onPanResponderRelease: (_, g) => {
        const cur = lastY.current + g.dy
        const mid = SCREEN_H - SNAP_HALF
        if (g.vy < -0.5 || cur < SCREEN_H - SNAP_FULL * 0.7) {
          snapTo(SCREEN_H - SNAP_FULL)
        } else if (g.vy > 0.5 || cur > SCREEN_H - SNAP_PEEK * 2.5) {
          snapTo(SCREEN_H - SNAP_PEEK)
        } else {
          snapTo(mid)
        }
      },
    })
  ).current

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Map fill ── */}
      <LinearGradient
        colors={['#E8EDF2', '#D4DCE8', '#C8D4E0']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Grid lines to suggest a map */}
      {[0.2, 0.38, 0.56, 0.74].map((frac, i) => (
        <View key={`h${i}`} style={[styles.mapLineH, { top: `${frac * 100}%` as any }]} />
      ))}
      {[0.15, 0.35, 0.55, 0.75, 0.88].map((frac, i) => (
        <View key={`v${i}`} style={[styles.mapLineV, { left: `${frac * 100}%` as any }]} />
      ))}

      {/* Road highlights */}
      <View style={[styles.road, { top: '38%', width: '100%', height: 6 }]} />
      <View style={[styles.road, { top: '56%', width: '100%', height: 4 }]} />
      <View style={[styles.roadV, { left: '35%', height: '100%', width: 5 }]} />
      <View style={[styles.roadV, { left: '65%', height: '100%', width: 3 }]} />

      {/* Live pins */}
      {MAP_PINS.map((pin, i) => (
        <View key={i} style={[styles.pin, { top: pin.top as any, left: pin.left as any }]}>
          <View style={[styles.pinBubble, { backgroundColor: pin.color }]}>
            <Text style={styles.pinText}>{pin.wait}m</Text>
          </View>
          <View style={[styles.pinTail, { borderTopColor: pin.color }]} />
        </View>
      ))}

      {/* Search bar floating on map */}
      <View style={[styles.searchWrap, { top: insets.top + 12 }]}>
        <View style={styles.searchBar}>
          <Search size={15} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues, food, vibes..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.filterBtn}>
          <LinearGradient
            colors={[C.primaryGlow, C.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.filterGradient}
          >
            {/* Shimmer overlay */}
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.10)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <SlidersHorizontal size={17} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Zoom controls */}
      <View style={[styles.zoomControls, { bottom: SNAP_HALF + 24 }]}>
        <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>+</Text></Pressable>
        <View style={styles.zoomDivider} />
        <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>−</Text></Pressable>
      </View>
      <Pressable style={[styles.locateBtn, { bottom: SNAP_HALF + 90 }]}>
        <Text style={{ fontSize: 16 }}>◎</Text>
      </Pressable>

      {/* ── Bottom sheet ── */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetCount}>
              <Text style={styles.sheetCountNum}>{filtered.length}</Text>
              {' places nearby'}
            </Text>
            <View style={styles.sheetFilters}>
              <Text style={styles.sheetFilterActive}>All categories</Text>
              <Text style={styles.sheetFilterDot}>·</Text>
              <Text style={styles.sheetFilterActive}>Trending</Text>
            </View>
          </View>
        </View>

        {/* Venue list — inner ScrollView */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map(v => (
            <SheetVenueRow
              key={v.id}
              venue={v}
              onPress={() => router.push(`/venue/${v.id}`)}
            />
          ))}
          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

function SheetVenueRow({ venue, onPress }: { venue: typeof venues[0]; onPress: () => void }) {
  const waitColor = getWaitColor(getSeverity(venue.waitMinutes))
  return (
    <Pressable style={styles.venueRow} onPress={onPress} testID={`map-venue-${venue.id}`}>
      <Image source={{ uri: venue.image }} style={styles.venueThumb} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.venueMeta}>
          <MapPin size={9} color={C.muted} strokeWidth={2} />
          <Text style={styles.venueMetaText}>{venue.distance}</Text>
          <Text style={styles.venueMetaDot}>·</Text>
          <Users size={9} color={C.muted} strokeWidth={2} />
          <Text style={styles.venueMetaText}>{venue.liveReporters}</Text>
        </View>
      </View>
      <View style={[styles.waitPill, { backgroundColor: waitColor }]}>
        <Text style={styles.waitPillText}>{venue.waitMinutes} min</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Map decoration
  mapLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  mapLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.85)' },
  roadV: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.85)' },

  // Pins
  pin: { position: 'absolute', alignItems: 'center' },
  pinBubble: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  pinText: { fontSize: 10, fontWeight: '800', color: '#fff', fontFamily: fontFamily.displayBold },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 5,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  // Search
  searchWrap: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10, zIndex: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 9999,
    paddingHorizontal: 14, paddingVertical: 11,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.fg, fontFamily: fontFamily.body },
  filterBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  filterGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },

  // Zoom controls
  zoomControls: {
    position: 'absolute', right: 16,
    backgroundColor: '#fff', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    overflow: 'hidden',
  },
  zoomBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  zoomBtnText: { fontSize: 20, color: C.fg, fontWeight: '300' },
  zoomDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 8 },
  locateBtn: {
    position: 'absolute', right: 16, width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },

  // Sheet
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: -100,
    height: SCREEN_H,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },
  handleArea: { paddingBottom: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E07A3B', alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  sheetHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetCount: { fontSize: 13, color: C.muted, fontFamily: fontFamily.body },
  sheetCountNum: { fontSize: 13, fontWeight: '700', color: C.fg, fontFamily: fontFamily.display },
  sheetFilters: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetFilterActive: { fontSize: 12, fontWeight: '600', color: '#E07A3B', fontFamily: fontFamily.bodySemiBold },
  sheetFilterDot: { fontSize: 12, color: C.muted },

  listContent: { paddingHorizontal: 12, paddingTop: 8 },

  venueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  venueThumb: { width: 56, height: 56, borderRadius: 12 },
  venueName: { fontSize: 14, fontWeight: '600', color: C.fg, marginBottom: 4, fontFamily: fontFamily.display },
  venueMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venueMetaText: { fontSize: 11, color: C.muted, fontFamily: fontFamily.body },
  venueMetaDot: { fontSize: 11, color: C.muted },
  waitPill: { borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5 },
  waitPillText: { fontSize: 11, fontWeight: '700', color: '#fff', fontFamily: fontFamily.bodySemiBold },
})
