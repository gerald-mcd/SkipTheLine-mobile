import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Modal } from 'react-native'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Image } from 'react-native'
import { colors, spacing, radius, font } from '../../constants/theme'
import { venues, categories, getWaitColor, type Category } from '../../lib/mock-data'

type SortKey = 'trending' | 'wait' | 'distance'

const sortOptions: { id: SortKey; label: string; emoji: string }[] = [
  { id: 'trending', label: 'Trending', emoji: '🔥' },
  { id: 'wait', label: 'Shortest wait', emoji: '⏱️' },
  { id: 'distance', label: 'Closest', emoji: '📍' },
]

export default function DiscoverScreen() {
  const router = useRouter()
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('trending')
  const [radius, setRadius] = useState(5)
  const [filterOpen, setFilterOpen] = useState(false)
  const [draftCat, setDraftCat] = useState<Category | 'all'>('all')
  const [draftSort, setDraftSort] = useState<SortKey>('trending')
  const [draftRadius, setDraftRadius] = useState(5)

  const list = useMemo(() => {
    const filtered = venues.filter(v => {
      if (cat !== 'all' && v.category !== cat) return false
      if (parseFloat(v.distance) > radius) return false
      return true
    })
    const sorted = [...filtered]
    if (sort === 'wait') sorted.sort((a, b) => a.waitMinutes - b.waitMinutes)
    else if (sort === 'distance') sorted.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    else sorted.sort((a, b) => b.liveReporters - a.liveReporters)
    return sorted
  }, [cat, sort, radius])

  const draftCount = useMemo(
    () => venues.filter(v => {
      if (draftCat !== 'all' && v.category !== draftCat) return false
      if (parseFloat(v.distance) > draftRadius) return false
      return true
    }).length,
    [draftCat, draftRadius],
  )

  const filtersActive = cat !== 'all' || sort !== 'trending' || radius !== 5

  const openFilter = () => {
    setDraftCat(cat)
    setDraftSort(sort)
    setDraftRadius(radius)
    setFilterOpen(true)
  }

  const applyFilter = () => {
    setCat(draftCat)
    setSort(draftSort)
    setRadius(draftRadius)
    setFilterOpen(false)
  }

  const resetFilter = () => {
    setDraftCat('all')
    setDraftSort('trending')
    setDraftRadius(5)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search venues, food, vibes..."
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
            onPress={openFilter}
            activeOpacity={0.85}
          >
            <Text style={styles.filterBtnText}>⚙️</Text>
            {filtersActive && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.resultCount}>
          {list.length} {list.length === 1 ? 'place' : 'places'} nearby
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={list}
        keyExtractor={v => v.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No places match this filter.</Text>
        }
        renderItem={({ item: v }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/venue/${v.id}`)}
            activeOpacity={0.88}
          >
            <Image source={{ uri: v.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={1}>{v.name}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardMetaText}>📍 {v.distance}</Text>
                <Text style={styles.cardMetaText}>👥 {v.liveReporters}</Text>
              </View>
              {v.event && (
                <View style={styles.eventChip}>
                  <Text style={styles.eventChipText}>🎵 {v.event}</Text>
                </View>
              )}
            </View>
            <View style={[styles.waitBadge, { backgroundColor: getWaitColor(v.severity) }]}>
              <Text style={styles.waitBadgeNum}>{v.waitMinutes}</Text>
              <Text style={styles.waitBadgeUnit}>min</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Filter modal */}
      <Modal visible={filterOpen} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setFilterOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity onPress={() => setFilterOpen(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={resetFilter}>
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Categories */}
              <Text style={styles.filterSectionLabel}>Categories</Text>
              <View style={styles.chipWrap}>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.filterChip, draftCat === c.id && styles.filterChipActive]}
                    onPress={() => setDraftCat(c.id)}
                  >
                    <Text style={[styles.filterChipText, draftCat === c.id && styles.filterChipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Distance */}
              <Text style={styles.filterSectionLabel}>Distance</Text>
              <View style={styles.distanceRow}>
                <TouchableOpacity
                  style={styles.distanceBtn}
                  onPress={() => setDraftRadius(r => Math.max(1, r - 1))}
                >
                  <Text style={styles.distanceBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.distanceValue}>{draftRadius} mi</Text>
                <TouchableOpacity
                  style={styles.distanceBtn}
                  onPress={() => setDraftRadius(r => Math.min(25, r + 1))}
                >
                  <Text style={styles.distanceBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Sort */}
              <Text style={styles.filterSectionLabel}>Sort by</Text>
              <View style={styles.chipWrap}>
                {sortOptions.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.filterChip, draftSort === s.id && styles.filterChipActive]}
                    onPress={() => setDraftSort(s.id)}
                  >
                    <Text style={[styles.filterChipText, draftSort === s.id && styles.filterChipTextActive]}>
                      {s.emoji} {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.modalCTA}>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilter} activeOpacity={0.85}>
                <Text style={styles.applyBtnText}>Show {draftCount} {draftCount === 1 ? 'result' : 'results'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: colors.text, fontSize: font.base },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText: { fontSize: 18 },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.waitShort,
    borderWidth: 2,
    borderColor: colors.background,
  },
  resultCount: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 100, gap: 10 },
  emptyText: { textAlign: 'center', color: colors.textMuted, paddingVertical: 40, fontSize: font.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: { width: 56, height: 56, borderRadius: radius.md },
  cardBody: { flex: 1 },
  cardName: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  cardMeta: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  cardMetaText: { fontSize: 11, color: colors.textMuted },
  eventChip: {
    marginTop: 4,
    backgroundColor: 'rgba(108,71,255,0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  eventChipText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  waitBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitBadgeNum: { color: colors.white, fontSize: font.md, fontWeight: '800' },
  waitBadgeUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: { color: colors.textMuted, fontSize: 14 },
  modalTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  modalResetText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  modalScroll: { paddingHorizontal: spacing.lg },
  filterSectionLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.text },
  filterChipTextActive: { color: colors.white },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  distanceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBtnText: { fontSize: 18, color: colors.text, lineHeight: 22 },
  distanceValue: { fontSize: font.base, fontWeight: '700', color: colors.primary, minWidth: 56, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  modalCTA: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnText: { color: colors.white, fontWeight: '700', fontSize: font.base },
})
