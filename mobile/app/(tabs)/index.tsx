import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { colors, spacing, radius, font } from '../../constants/theme'
import { venues, categories, getWaitColor, type Category } from '../../lib/mock-data'

const { height } = Dimensions.get('window')

export default function MapScreen() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedVenue, setSelectedVenue] = useState<typeof venues[0] | null>(null)

  const filtered = selectedCategory === 'all'
    ? venues
    : venues.filter(v => v.category === selectedCategory)

  return (
    <View style={styles.container}>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude:        25.7617,
          longitude:       -80.1918,
          latitudeDelta:   0.04,
          longitudeDelta:  0.04,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        {filtered.map(venue => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            onPress={() => setSelectedVenue(venue)}
          >
            <View style={[styles.pin, { backgroundColor: getWaitColor(venue.severity) }]}>
              <Text style={styles.pinText}>{venue.waitMinutes}m</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search venues in Miami...</Text>
      </View>

      {/* Category chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.chipLabel, selectedCategory === cat.id && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom venue card when pin tapped */}
      {selectedVenue && (
        <TouchableOpacity
          style={styles.venueCard}
          onPress={() => router.push(`/venue/${selectedVenue.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.venueCardInner}>
            <View style={styles.venueCardLeft}>
              <Text style={styles.venueName}>{selectedVenue.name}</Text>
              <Text style={styles.venueCategory}>{selectedVenue.categoryLabel} · {selectedVenue.distance}</Text>
              <View style={styles.venueReporters}>
                <Text style={styles.venueReportersText}>
                  👥 {selectedVenue.liveReporters} reporting · {selectedVenue.lastReportMinutes}m ago
                </Text>
              </View>
            </View>
            <View style={[styles.waitBadge, { backgroundColor: getWaitColor(selectedVenue.severity) }]}>
              <Text style={styles.waitBadgeText}>{selectedVenue.waitMinutes}</Text>
              <Text style={styles.waitBadgeUnit}>min</Text>
            </View>
          </View>
          {selectedVenue.event && (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>🎵 {selectedVenue.event}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={() => setSelectedVenue(null)}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Report FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Report</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  searchBar: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: colors.textMuted, fontSize: font.base },
  chipsWrapper: {
    position: 'absolute',
    top: 116,
    left: 0,
    right: 0,
  },
  chips: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  chipLabelActive: { color: colors.white },
  pin: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  venueCard: {
    position: 'absolute',
    bottom: 96,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  venueCardInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  venueCardLeft: { flex: 1 },
  venueName: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  venueCategory: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  venueReporters: { marginTop: 4 },
  venueReportersText: { fontSize: 11, color: colors.textMuted },
  waitBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  waitBadgeText: { color: colors.white, fontSize: font.lg, fontWeight: '800' },
  waitBadgeUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  eventBadge: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(108,71,255,0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  eventBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  dismissBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: 4,
  },
  dismissText: { color: colors.textMuted, fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: font.base },
})

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#0f3460' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]
