import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput,
  Animated, PanResponder, Dimensions, StatusBar, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Search, MapPin, Users, SlidersHorizontal, ChevronDown } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { getSeverity, getWaitColor } from '@/lib/mock-data'
// getSeverity + getWaitColor still used for wait pill color logic
import { getLaunchedVenues, type Venue } from '@/lib/queries'
import { fontFamily } from '@/constants/theme'
import { MAP_STYLE, MIAMI_REGION, getWaitColorFromMinutes } from '@/lib/map-style'
import { WaitDotPin, WaitTearDropPin } from '@/components/MapPins'

// react-native-maps only available after EAS dev build — safe import
let MapView: any = null
let Marker: any = null
try {
  const RNMaps = require('react-native-maps')
  MapView = RNMaps.default
  Marker = RNMaps.Marker
} catch (_) {}

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
const SNAP_PEEK = 100
const SNAP_HALF = SCREEN_H * 0.45
const SNAP_FULL = SCREEN_H * 0.92

// Fallback decorative pins for Expo Go (no native maps)
const MAP_PINS = [
  { top: '22%', left: '18%', wait: 8, color: '#5DB18A', label: 'Whole Foods' },
  { top: '42%', left: '58%', wait: 55, color: '#D9462E', label: 'Sugar Rooftop' },
  { top: '30%', left: '72%', wait: 42, color: '#F8682B', label: 'Komodo' },
  { top: '60%', left: '25%', wait: 12, color: '#5DB18A', label: 'Zuma' },
  { top: '50%', left: '45%', wait: 28, color: '#D69A3F', label: 'Truluck\'s' },
  { top: '35%', left: '38%', wait: 65, color: '#D9462E', label: 'LIV' },
]

export default function DiscoverScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [isAtFullSnap, setIsAtFullSnap] = useState(false)
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const listScrollY = useRef(0)

  useEffect(() => {
    getLaunchedVenues().then(setAllVenues)
  }, [])

  const filtered = allVenues
    .filter(v => !search.trim() || v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.live_reporters - a.live_reporters)

  // Sheet animation
  const sheetY = useRef(new Animated.Value(SCREEN_H - SNAP_HALF)).current
  const lastY = useRef(SCREEN_H - SNAP_HALF)

  function snapTo(target: number) {
    lastY.current = target
    setIsAtFullSnap(target === SCREEN_H - SNAP_FULL)
    Animated.spring(sheetY, { toValue: target, damping: 24, stiffness: 200, mass: 1, useNativeDriver: true }).start()
  }

  function collapseSheet() {
    snapTo(SCREEN_H - SNAP_HALF)
  }

  useEffect(() => {
    snapTo(SCREEN_H - SNAP_HALF)
  }, [])

  // Handle-only pan responder — always intercepts drag on the handle bar
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        sheetY.stopAnimation()
      },
      onPanResponderMove: (_, g) => {
        const next = lastY.current + g.dy
        // Only allow dragging within bounds — never below SNAP_HALF (no peek from handle)
        if (next >= SCREEN_H - SNAP_FULL && next <= SCREEN_H - SNAP_HALF) {
          sheetY.setValue(next)
        }
      },
      onPanResponderRelease: (_, g) => {
        const cur = lastY.current + g.dy
        // Fast upward flick OR past midpoint between half and full → snap full
        if (g.vy < -0.3 || cur < SCREEN_H - (SNAP_HALF + (SNAP_FULL - SNAP_HALF) * 0.4)) {
          snapTo(SCREEN_H - SNAP_FULL)
        } else {
          // Always snap back to half — never to peek from handle
          snapTo(SCREEN_H - SNAP_HALF)
        }
      },
    })
  ).current

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Map ── real Google Maps after EAS build, decorative fallback in Expo Go */}
      {MapView ? (
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider="google"
          customMapStyle={MAP_STYLE}
          initialRegion={MIAMI_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
        >
          {allVenues.map(v => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.lat ?? 25.7617, longitude: v.lng ?? -80.1918 }}
              tracksViewChanges={false}
              onPress={() => router.push(`/venue/${v.id}`)}
            >
              <WaitDotPin minutes={v.current_wait_minutes} />
            </Marker>
          ))}
        </MapView>
      ) : (
        // Expo Go fallback — decorative placeholder
        <>
          <LinearGradient
            colors={['#F5F5F5', '#EFEFEF', '#E8E8E8']}
            style={StyleSheet.absoluteFillObject}
          />
          {[0.2, 0.38, 0.56, 0.74].map((frac, i) => (
            <View key={`h${i}`} style={[styles.mapLineH, { top: `${frac * 100}%` as any }]} />
          ))}
          {[0.15, 0.35, 0.55, 0.75, 0.88].map((frac, i) => (
            <View key={`v${i}`} style={[styles.mapLineV, { left: `${frac * 100}%` as any }]} />
          ))}
          <View style={[styles.road, { top: '38%', width: '100%', height: 5 }]} />
          <View style={[styles.road, { top: '56%', width: '100%', height: 3 }]} />
          <View style={[styles.roadV, { left: '35%', height: '100%', width: 4 }]} />
          <View style={[styles.roadV, { left: '65%', height: '100%', width: 3 }]} />
          {MAP_PINS.map((pin, i) => (
            <View key={i} style={[styles.pin, { top: pin.top as any, left: pin.left as any }]}>
              <WaitDotPin minutes={pin.wait} />
            </View>
          ))}
        </>
      )}

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
        <Pressable style={[styles.filterBtn, { backgroundColor: '#F8682B' }]}>
          <SlidersHorizontal size={17} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>


      {/* ── Bottom sheet ── */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>

        {/* Handle bar — always draggable */}
        <View {...handlePanResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            {/* Close button — only visible when fully expanded */}
            {isAtFullSnap && (
              <Pressable style={styles.closeBtn} onPress={collapseSheet}>
                <ChevronDown size={18} color={C.muted} strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
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

        {/* Venue list — fixed height so scroll works at every snap position */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 48 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={(e) => {
            listScrollY.current = e.nativeEvent.contentOffset.y
          }}
        >
          {filtered.map(v => (
            <SheetVenueRow
              key={v.id}
              venue={v}
              onPress={() => router.push(`/venue/${v.id}`)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  )
}

function SheetVenueRow({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  const waitColor = getWaitColor(getSeverity(venue.current_wait_minutes))
  return (
    <Pressable style={styles.venueRow} onPress={onPress} testID={`map-venue-${venue.id}`}>
      <Image source={{ uri: venue.primary_image_url ?? '' }} style={styles.venueThumb} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.venueMeta}>
          <MapPin size={9} color={C.muted} strokeWidth={2} />
          <Text style={styles.venueMetaText}>{venue.neighborhood ?? venue.city}</Text>
          <Text style={styles.venueMetaDot}>·</Text>
          <Users size={9} color={C.muted} strokeWidth={2} />
          <Text style={styles.venueMetaText}>{venue.live_reporters}</Text>
        </View>
      </View>
      <View style={[styles.waitPill, { overflow: 'hidden' }]}>
        <LinearGradient
          colors={[waitColor, waitColor]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.waitPillGradient}
        >
          <Text style={styles.waitPillText}>{venue.current_wait_minutes} min</Text>
        </LinearGradient>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Expo Go fallback map decoration
  mapLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  mapLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  road: { position: 'absolute', backgroundColor: '#FFFFFF' },
  roadV: { position: 'absolute', backgroundColor: '#FFFFFF' },
  pin: { position: 'absolute', alignItems: 'center' },

  // Search
  searchWrap: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10, zIndex: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 9999,
    paddingHorizontal: 14, paddingVertical: 11,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.fg, fontFamily: fontFamily.body },
  filterBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },


  // Sheet
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: -100,
    height: SCREEN_H,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },
  handleArea: { paddingBottom: 8 },
  handleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 10, marginBottom: 12, position: 'relative',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#F8682B', opacity: 0.85 },
  closeBtn: {
    position: 'absolute', right: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F0EB',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetCount: { fontSize: 13, color: C.muted, fontFamily: fontFamily.body },
  sheetCountNum: { fontSize: 13, fontWeight: '700', color: C.fg, fontFamily: fontFamily.display },
  sheetFilters: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetFilterActive: { fontSize: 12, fontWeight: '600', color: '#F8682B', fontFamily: fontFamily.bodySemiBold },
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
  waitPill: { borderRadius: 9999 },
  waitPillGradient: { borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5 },
  waitPillText: { fontSize: 11, fontWeight: '700', color: '#fff', fontFamily: fontFamily.bodySemiBold },
})
