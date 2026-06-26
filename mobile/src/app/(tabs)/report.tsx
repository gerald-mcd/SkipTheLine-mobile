import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  Modal,
} from 'react-native'
import { useRef, useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin, Search, X, ChevronRight, Zap, Star } from 'lucide-react-native'
import { getWaitColor, getSeverity } from '@/lib/mock-data'
import { getLaunchedVenues, type Venue } from '@/lib/queries'
import { fontFamily } from '@/constants/theme'

const COLORS = {
  background: '#FCFBF9',
  primary: '#F8682B',
  primaryGlow: '#F2934D',
  card: '#FFFFFF',
  border: '#EDE6DD',
  foreground: '#33384A',
  mutedForeground: '#857565',
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const PRESET_OPTIONS = [
  { label: 'No wait', value: 0 },
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '60m', value: 60 },
]

const NOTE_MAX_LENGTH = 140

export default function ReportScreen() {
  const router = useRouter()
  const { venueId: paramVenueId } = useLocalSearchParams<{ venueId?: string }>()
  const [waitMinutes, setWaitMinutes] = useState<number>(15)
  const [comment, setComment] = useState<string>('')
  const [selectedVenueId, setSelectedVenueId] = useState<string>(paramVenueId ?? '')
  const [showVenuePicker, setShowVenuePicker] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [exactInput, setExactInput] = useState<string>('15')
  const [allVenues, setAllVenues] = useState<Venue[]>([])

  useEffect(() => {
    getLaunchedVenues().then(v => {
      setAllVenues(v)
      // Set first real venue as default if no param
      if (!paramVenueId && v.length > 0) setSelectedVenueId(v[0].id)
    })
  }, [])

  useEffect(() => {
    if (paramVenueId) setSelectedVenueId(paramVenueId)
  }, [paramVenueId])

  const selectedVenue = allVenues.find(v => v.id === selectedVenueId) ?? allVenues[0]

  // Toast animation
  const toastAnim = useRef(new Animated.Value(0)).current

  function handlePresetSelect(value: number) {
    setWaitMinutes(value)
    setExactInput(String(value))
  }

  function handleExactInputChange(text: string) {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '')
    setExactInput(numericText)
    const parsed = parseInt(numericText, 10)
    if (!isNaN(parsed)) {
      setWaitMinutes(Math.min(180, Math.max(0, parsed)))
    } else if (numericText === '') {
      setWaitMinutes(0)
    }
  }

  function handleSubmit() {
    setShowToast(true)
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.delay(1600),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false)
      router.back()
    })
  }

  const isPresetSelected = (value: number) => waitMinutes === value

  return (
    <SafeAreaView edges={['top']} style={styles.safe} testID="report-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>NEW REPORT</Text>
            <Text style={styles.headerTitle}>Report a wait</Text>
          </View>
          <Pressable
            testID="close-button"
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={18} color={COLORS.foreground} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* YOU'RE AT venue card */}
        <Text style={styles.sectionLabel}>YOU'RE AT</Text>
        <Pressable testID="venue-picker" style={styles.venueCard} onPress={() => setShowVenuePicker(true)}>
          <View style={styles.venueCardLeft}>
            <View style={styles.venueIconCircle}>
              <MapPin size={18} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.venueCardName} numberOfLines={1}>{selectedVenue?.name ?? 'Select a venue'}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.mutedForeground} strokeWidth={2} />
        </Pressable>

        {/* HOW LONG IS THE WAIT? */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HOW LONG IS THE WAIT?</Text>

          {/* Large number display */}
          <View style={styles.bigNumberRow}>
            <Text style={styles.bigNumber}>{waitMinutes}</Text>
            <Text style={styles.bigNumberUnit}>min</Text>
          </View>

          {/* Preset time buttons - 2 rows of 3 */}
          <View style={styles.presetGrid}>
            <View style={styles.presetRow}>
              {PRESET_OPTIONS.slice(0, 3).map((opt) => (
                <Pressable
                  key={opt.value}
                  testID={`preset-${opt.value}`}
                  style={[
                    styles.presetChip,
                    isPresetSelected(opt.value) && styles.presetChipActive,
                  ]}
                  onPress={() => handlePresetSelect(opt.value)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isPresetSelected(opt.value) && styles.presetChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.presetRow}>
              {PRESET_OPTIONS.slice(3, 6).map((opt) => (
                <Pressable
                  key={opt.value}
                  testID={`preset-${opt.value}`}
                  style={[
                    styles.presetChip,
                    isPresetSelected(opt.value) && styles.presetChipActive,
                  ]}
                  onPress={() => handlePresetSelect(opt.value)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isPresetSelected(opt.value) && styles.presetChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Exact input */}
          <View style={styles.exactRow}>
            <Text style={styles.exactLabel}>Or enter exact:</Text>
            <View style={styles.exactInputWrapper}>
              <TextInput
                testID="exact-input"
                style={styles.exactInput}
                value={exactInput}
                onChangeText={handleExactInputChange}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
              />
              <Text style={styles.exactInputSuffix}>min</Text>
            </View>
          </View>
        </View>

        {/* ADD A NOTE */}
        <Text style={styles.sectionLabel}>ADD A NOTE (optional)</Text>
        <View style={styles.noteCard}>
          <TextInput
            testID="comment-input"
            style={styles.commentInput}
            placeholder="e.g. bar seating moves faster"
            placeholderTextColor={COLORS.mutedForeground}
            value={comment}
            onChangeText={(text) => setComment(text.slice(0, NOTE_MAX_LENGTH))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={NOTE_MAX_LENGTH}
          />
          <Text style={styles.charCount}>{comment.length}/{NOTE_MAX_LENGTH}</Text>
        </View>

        {/* Points earned card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsLeft}>
            <View style={styles.pointsIconCircle}>
              <Star size={14} color={COLORS.primary} strokeWidth={2.5} fill={COLORS.primary} />
            </View>
            <Text style={styles.pointsText}>You'll earn</Text>
          </View>
          <Text style={styles.pointsValue}>+15 pts</Text>
        </View>

        {/* Submit button */}
        <View style={styles.submitWrapper}>
          <Pressable
            testID="submit-button"
            style={styles.submitPressable}
            onPress={handleSubmit}
          >
            <View style={styles.submitGradient}>
              <Zap size={16} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
              <Text style={styles.submitText}>Submit report  ·  +15 pts</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Toast */}
      {showToast ? (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>Report sent! +15 points</Text>
        </Animated.View>
      ) : null}

      {showVenuePicker ? (
        <VenuePickerModal
          selectedId={selectedVenueId}
          venues={allVenues}
          onSelect={(id) => {
            setSelectedVenueId(id)
            setShowVenuePicker(false)
          }}
          onClose={() => setShowVenuePicker(false)}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: fontFamily.accent,
    color: COLORS.mutedForeground,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    color: COLORS.foreground,
    letterSpacing: -0.5,
    fontFamily: fontFamily.displayBold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontFamily: fontFamily.accent,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // Venue card
  venueCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  venueCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  venueIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(224,122,59,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCardName: {
    fontSize: 15,
    color: COLORS.foreground,
    fontFamily: fontFamily.displaySemi,
    flex: 1,
  },

  // Card container
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: fontFamily.accent,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // Big number display
  bigNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bigNumber: {
    fontSize: 64,
    color: COLORS.primary,
    letterSpacing: -3,
    lineHeight: 70,
    fontFamily: fontFamily.displayBold,
  },
  bigNumberUnit: {
    fontSize: 20,
    color: COLORS.primary,
    marginLeft: 4,
    fontFamily: fontFamily.bodySemiBold,
    opacity: 0.7,
  },

  // Preset grid
  presetGrid: {
    gap: 8,
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 13,
    color: COLORS.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },

  // Exact input
  exactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exactLabel: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.body,
  },
  exactInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  exactInput: {
    fontSize: 15,
    color: COLORS.foreground,
    fontFamily: fontFamily.bodySemiBold,
    minWidth: 36,
    textAlign: 'center',
    padding: 0,
  },
  exactInputSuffix: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.body,
  },

  // Note card
  noteCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 20,
  },
  commentInput: {
    fontSize: 14,
    color: COLORS.foreground,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    minHeight: 72,
    lineHeight: 20,
    fontFamily: fontFamily.body,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.body,
    textAlign: 'right',
    marginTop: 6,
  },

  // Points card
  pointsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(224,122,59,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: COLORS.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  pointsValue: {
    fontSize: 15,
    color: COLORS.primary,
    fontFamily: fontFamily.displayBold,
    letterSpacing: -0.3,
  },

  // Submit
  submitWrapper: {
    marginTop: 4,
  },
  submitPressable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(99,102,241,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  submitGradient: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8682B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 8,
  },
  submitText: {
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: fontFamily.bodySemiBold,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: '#33384A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
  },
})

function VenuePickerModal({
  selectedId,
  venues,
  onSelect,
  onClose,
}: {
  selectedId: string
  venues: Venue[]
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [q, setQ] = useState<string>('')

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return venues
    return venues.filter(v =>
      v.name.toLowerCase().includes(term) ||
      (v.category_label ?? '').toLowerCase().includes(term)
    )
  }, [q, venues])

  return (
    <Modal visible animationType="slide" transparent>
      <Pressable style={pickerStyles.backdrop} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.handleBar} />
        <View style={pickerStyles.header}>
          <View>
            <Text style={pickerStyles.pretitle}>Reporting at</Text>
            <Text style={pickerStyles.title}>Pick a venue</Text>
          </View>
          <Pressable style={pickerStyles.closeBtn} onPress={onClose} testID="venue-picker-close">
            <X size={16} color={COLORS.foreground} />
          </Pressable>
        </View>
        <View style={pickerStyles.searchRow}>
          <Search size={15} color={COLORS.mutedForeground} />
          <TextInput
            style={pickerStyles.input}
            placeholder="Search venues..."
            placeholderTextColor={COLORS.mutedForeground}
            value={q}
            onChangeText={setQ}
            autoFocus
          />
          {q !== '' ? (
            <Pressable onPress={() => setQ('')}>
              <X size={14} color={COLORS.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          contentContainerStyle={pickerStyles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {results.map(v => {
            const waitColor = getWaitColor(getSeverity(v.current_wait_minutes))
            const isSelected = v.id === selectedId
            return (
              <Pressable
                key={v.id}
                style={[pickerStyles.venueRow, isSelected && pickerStyles.venueRowSelected]}
                onPress={() => onSelect(v.id)}
                testID={`venue-picker-item-${v.id}`}
              >
                <View style={pickerStyles.venueInfo}>
                  <Text style={pickerStyles.venueName} numberOfLines={1}>{v.name}</Text>
                  <View style={pickerStyles.venueMeta}>
                    <MapPin size={10} color={COLORS.mutedForeground} />
                    <Text style={pickerStyles.venueMetaText}>
                      {v.category_label} · {v.neighborhood ?? v.city}
                    </Text>
                  </View>
                </View>
                <View style={[pickerStyles.waitPill, { backgroundColor: waitColor }]}>
                  <Text style={pickerStyles.waitPillText}>{v.current_wait_minutes}m</Text>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    </Modal>
  )
}

const pickerStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  pretitle: {
    fontSize: 9, fontWeight: '700',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    color: COLORS.foreground, letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: COLORS.background,
    borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  input: { flex: 1, fontSize: 13, color: COLORS.foreground },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 8, paddingBottom: 16 },
  venueRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 12,
  },
  venueRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(224,122,59,0.06)',
  },
  venueInfo: { flex: 1 },
  venueName: {
    fontSize: 14, fontWeight: '700',
    color: COLORS.foreground, marginBottom: 3,
  },
  venueMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venueMetaText: { fontSize: 11, color: COLORS.mutedForeground },
  waitPill: {
    borderRadius: 9999,
    paddingHorizontal: 10, paddingVertical: 4,
    flexShrink: 0,
  },
  waitPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
})
