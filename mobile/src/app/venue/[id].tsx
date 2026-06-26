import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Navigation,
  Clock,
  MapPin,
  Star,
  Camera,
  MessageSquare,
  Calendar,
  User,
} from 'lucide-react-native'
import Svg, { Polyline, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { venues, severityColor } from '@/lib/mock-data'
import { fontFamily } from '@/constants/theme'
import { useColors } from '@/lib/theme-store'
import { openDirections } from '@/lib/actions'
import { ReviewModal } from '@/components/ReviewModal'

const COLORS = {
  background: '#FCFBF9',
  primary: '#F8682B',
  card: '#FFFFFF',
  border: '#EDE6DD',
  foreground: '#33384A',
  mutedForeground: '#857565',
  peachBadgeBg: '#FFF0E8',
  peachBadgeText: '#E07A3B',
}

const AVATAR_COLORS = ['#5DB18A', '#D69A3F', '#E07A3B', '#857565', '#33384A']

function StarRow({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={11}
          color={i <= count ? '#F59E0B' : '#EDE6DD'}
          fill={i <= count ? '#F59E0B' : 'transparent'}
          strokeWidth={1.5}
        />
      ))}
    </View>
  )
}

const SPARK_DATA = [22, 35, 55, 70, 78, 60, 42, 28]
const SPARK_W = 80
const SPARK_H = 36

function Sparkline({ color }: { color: string }) {
  const maxVal = Math.max(...SPARK_DATA)
  const pts = SPARK_DATA.map((v, i) => ({
    x: (i / (SPARK_DATA.length - 1)) * SPARK_W,
    y: SPARK_H - (v / maxVal) * SPARK_H * 0.85 - SPARK_H * 0.05,
  }))
  const linePoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `M ${pts[0].x},${pts[0].y} ${pts.slice(1).map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L ${SPARK_W},${SPARK_H} L 0,${SPARK_H} Z`
  return (
    <Svg width={SPARK_W} height={SPARK_H}>
      <Defs>
        <SvgGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.28} />
          <Stop offset="1" stopColor={color} stopOpacity={0.0} />
        </SvgGradient>
      </Defs>
      <Path d={areaD} fill="url(#sg)" />
      <Polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const c = useColors()
  const venue = venues.find(x => x.id === id) ?? venues[0]
  const [isFavorited, setIsFavorited] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)


  async function handleAddPhoto() {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
  }

  const photos = venue.photos?.length ? venue.photos : [venue.image]
  const reviews = venue.reviews ?? []
  const recentReports = venue.recentReports ?? []
  const averageRating = venue.averageRating ?? 0
  const [photoIdx, setPhotoIdx] = useState<number>(0)

  const liveColor = severityColor(venue.severity)
  const liveLabelText = venue.severity === 'short'
    ? 'SHORT LINE'
    : venue.severity === 'moderate'
    ? 'MODERATE LINE'
    : 'LONG LINE'


  return (
    <View style={styles.container} testID="venue-detail-screen">
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          {photos.map((src, i) => (
            <Image
              key={src}
              source={{ uri: src }}
              style={[
                styles.heroImage,
                { opacity: i === photoIdx ? 1 : 0, position: i === 0 ? 'relative' : 'absolute' },
              ]}
              resizeMode="cover"
            />
          ))}

          {/* Photo nav arrows */}
          <Pressable
            testID="photo-prev-button"
            style={styles.photoArrowLeft}
            onPress={() => setPhotoIdx(i => (i === 0 ? photos.length - 1 : i - 1))}
          >
            <ChevronLeft size={16} color="#000" strokeWidth={2} />
          </Pressable>
          <Pressable
            testID="photo-next-button"
            style={styles.photoArrowRight}
            onPress={() => setPhotoIdx(i => (i === photos.length - 1 ? 0 : i + 1))}
          >
            <ChevronRight size={16} color="#000" strokeWidth={2} />
          </Pressable>

          {/* Photo dots */}
          <View style={styles.photoDots}>
            {photos.map((_, i) => (
              <Pressable
                key={i}
                testID={`photo-dot-${i}`}
                onPress={() => setPhotoIdx(i)}
                style={[
                  styles.photoDot,
                  {
                    width: i === photoIdx ? 18 : 6,
                    backgroundColor: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.55)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.heroGradient}
          />

          {/* Back / heart nav */}
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <Pressable
              testID="back-button"
              style={styles.heroNavBtn}
              onPress={() => router.back()}
            >
              <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <Pressable testID="heart-button" style={styles.heroNavBtn} onPress={() => setIsFavorited(prev => !prev)}>
              <Heart size={20} color={isFavorited ? '#E07A3B' : '#FFFFFF'} fill={isFavorited ? '#E07A3B' : 'transparent'} strokeWidth={2} />
            </Pressable>
          </SafeAreaView>

          {/* Hero bottom info */}
          <View style={styles.heroBottom}>
            {/* Vibe tags small-caps */}
            <Text style={styles.heroVibeTags}>
              {`${venue.categoryLabel.toUpperCase()} · ${venue.vibe.toUpperCase()}`}
            </Text>
            {/* Venue name */}
            <Text style={styles.heroName}>{venue.name}</Text>
            {/* Address with MapPin */}
            <View style={styles.heroAddressRow}>
              <MapPin size={10} color="rgba(255,255,255,0.85)" strokeWidth={2} />
              <Text style={styles.heroAddress}>{venue.address}</Text>
            </View>
          </View>
        </View>

        {/* ── Action row: Directions + Report wait ── */}
        <View style={styles.actionRow}>
          <Pressable testID="directions-button" style={styles.actionPillSecondary} onPress={() => openDirections(venue.lat, venue.lng, venue.name)}>
            <Navigation size={15} color={COLORS.foreground} strokeWidth={2} />
            <Text style={styles.actionPillSecondaryText}>Directions</Text>
          </Pressable>
          <Pressable
            testID="report-wait-action-button"
            style={styles.actionPillPrimary}
            onPress={() => router.push({ pathname: '/(tabs)/report', params: { venueId: venue.id } })}
          >
            <Clock size={15} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionPillPrimaryText}>Report wait</Text>
          </Pressable>
        </View>

        {/* ── Live Wait card ── */}
        <View style={styles.section}>
          <View style={styles.liveWaitCard}>
            {/* Row 1: label + sparkline */}
            <View style={styles.liveWaitTopRow}>
              <Text style={styles.liveWaitLabel}>LIVE WAIT</Text>
              <Sparkline color={liveColor} />
            </View>

            {/* Row 2: big number + "min" */}
            <View style={styles.liveWaitNumRow}>
              <Text style={[styles.liveWaitNumber, { color: liveColor }]}>
                {venue.waitMinutes}
              </Text>
              <Text style={styles.liveWaitUnit}>min</Text>
            </View>

            {/* Row 3: severity label + updated */}
            <View style={styles.liveWaitBottomRow}>
              <Text style={[styles.liveWaitSeverity, { color: liveColor }]}>
                {liveLabelText}
              </Text>
              <View style={styles.liveWaitUpdatedRow}>
                <Clock size={11} color={COLORS.mutedForeground} strokeWidth={2} />
                <Text style={styles.liveWaitUpdated}>
                  {`Updated ${venue.lastReportMinutes}m ago`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Driving the Crowd (event) ── */}
        {venue.event ? (
          <View style={styles.section}>
            <View style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Calendar size={14} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.eventLabel}>DRIVING THE CROWD</Text>
              </View>
              <Text style={styles.eventName}>{venue.event}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Stats row (3 equal boxes) ── */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Clock size={14} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{`${venue.typicalWaitMinutes}m`}</Text>
              <Text style={styles.statLabel}>AVG WAIT</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMiddle]}>
              <MessageSquare size={14} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{venue.reportsCount}</Text>
              <Text style={styles.statLabel}>REPORTS</Text>
            </View>
            <View style={styles.statBox}>
              <Clock size={14} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{venue.hours}</Text>
              <Text style={styles.statLabel}>OPEN</Text>
            </View>
          </View>
        </View>

        {/* ── Reviews section ── */}
        <View style={styles.section}>
          {/* Section header */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsHeaderRight}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
              <Text style={styles.reviewsRatingText}>
                {`${averageRating} · ${reviews.length}`}
              </Text>
            </View>
          </View>
          <Text style={styles.reviewsSubtitle}>Pulled from Google · plus the community</Text>

          {/* Write review / Add photo buttons */}
          <View style={styles.reviewActionsRow}>
            <Pressable testID="write-review-button" style={styles.reviewBtnPrimary} onPress={() => setReviewOpen(true)}>
              <Star size={13} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.reviewBtnPrimaryText}>Write a review</Text>
            </Pressable>
            <Pressable testID="add-photo-button" style={styles.reviewBtnSecondary} onPress={handleAddPhoto}>
              <Camera size={13} color={COLORS.foreground} strokeWidth={2} />
              <Text style={styles.reviewBtnSecondaryText}>Add photo</Text>
            </Pressable>
          </View>

          {/* Review cards */}
          <View style={styles.reviewsList}>
            {reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewCardTop}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <View style={styles.reviewSourceBadge}>
                    <Text style={styles.reviewSourceText}>{review.source}</Text>
                  </View>
                  <View style={{ marginLeft: 'auto' }}>
                    <StarRow count={review.stars} />
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewAgo}>{review.ago}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Recent reports ── */}
        <View style={styles.section}>
          <View style={styles.recentReportsHeader}>
            <Text style={styles.sectionTitle}>Recent reports</Text>
            <Text style={styles.recentReportsSubtitle}>Names shown for friends only</Text>
          </View>

          <View style={styles.reportsList}>
            {recentReports.map((report, index) => {
              const waitColor = report.waitMinutes > 45
                ? '#D9462E'
                : report.waitMinutes > 15
                ? '#D69A3F'
                : '#5DB18A'
              return (
                <View
                  key={report.id}
                  style={[styles.reportCard, index > 0 && { marginTop: 8 }]}
                >
                  {/* Avatar */}
                  {report.isFriend && report.initial ? (
                    <View
                      style={[
                        styles.reportAvatar,
                        { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
                      ]}
                    >
                      <Text style={styles.reportAvatarText}>{report.initial}</Text>
                    </View>
                  ) : (
                    <View style={[styles.reportAvatar, { backgroundColor: '#EDE6DD' }]}>
                      <User size={14} color={COLORS.mutedForeground} strokeWidth={2} />
                    </View>
                  )}

                  {/* Name + meta */}
                  <View style={styles.reportContent}>
                    <View style={styles.reportNameRow}>
                      <Text style={[
                        styles.reportName,
                        !report.isFriend && { fontWeight: '400', color: COLORS.mutedForeground },
                      ]}>
                        {report.name}
                      </Text>
                      {report.isFriend ? (
                        <View style={styles.friendBadge}>
                          <Text style={styles.friendBadgeText}>FRIEND</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.reportMeta}>
                      {`${report.type} · ${report.agoText}`}
                    </Text>
                  </View>

                  {/* Wait time */}
                  <Text style={[styles.reportWaitTime, { color: waitColor }]}>
                    {`${report.waitMinutes}m`}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* ── Vibe tags ── */}
        <View style={[styles.section, styles.vibeSection]}>
          {(venue.vibe ?? '').split(' · ').filter(Boolean).map((tag, i) => (
            <View key={i} style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{tag}</Text>
            </View>
          ))}
          <View style={styles.vibeTag}>
            <Text style={styles.vibeTagText}>{venue.categoryLabel}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <ReviewModal visible={reviewOpen} venueName={venue.name} onClose={() => setReviewOpen(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Hero ──
  hero: {
    height: 420,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  heroVibeTags: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.0,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 8,
    fontFamily: fontFamily.displayBold,
  },
  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    fontFamily: fontFamily.body,
  },

  // Photo carousel controls
  photoArrowLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoArrowRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoDots: {
    position: 'absolute',
    bottom: 88,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  photoDot: {
    height: 6,
    borderRadius: 3,
  },

  // ── Action row ──
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  actionPillSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPillSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  actionPillPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#F8682B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: 'rgba(99,102,241,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  actionPillPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },

  // ── Section wrapper ──
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    fontFamily: fontFamily.display,
  },

  // ── Live Wait card ──
  liveWaitCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  liveWaitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  liveWaitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  liveWaitNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 6,
  },
  liveWaitNumber: {
    fontSize: 60,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -2,
    fontFamily: fontFamily.displayBold,
  },
  liveWaitUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.mutedForeground,
    paddingBottom: 8,
    fontFamily: fontFamily.body,
  },
  liveWaitBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveWaitSeverity: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  liveWaitUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveWaitUpdated: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    fontWeight: '500',
    fontFamily: fontFamily.body,
  },

  // ── Event card ──
  eventCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    fontFamily: fontFamily.display,
  },

  // ── Stats row ──
  statsRow: {
    flexDirection: 'row',
    gap: 0,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 3,
  },
  statBoxMiddle: {
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'center',
    fontFamily: fontFamily.display,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },

  // ── Reviews ──
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.foreground,
    fontFamily: fontFamily.body,
  },
  reviewsSubtitle: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginBottom: 12,
    fontFamily: fontFamily.body,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewBtnPrimary: {
    flex: 2,
    height: 44,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },
  reviewBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  reviewsList: {
    gap: 8,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
  },
  reviewCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
    fontFamily: fontFamily.display,
  },
  reviewSourceBadge: {
    backgroundColor: COLORS.peachBadgeBg,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  reviewSourceText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.peachBadgeText,
    letterSpacing: 0.5,
    fontFamily: fontFamily.accent,
  },
  reviewText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: fontFamily.body,
  },
  reviewAgo: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.body,
  },

  // ── Recent reports ──
  recentReportsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentReportsSubtitle: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '500',
    fontFamily: fontFamily.body,
  },
  reportsList: {
    gap: 8,
  },
  reportCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontFamily.displayBold,
  },
  reportContent: {
    flex: 1,
  },
  reportNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  reportName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
    fontFamily: fontFamily.display,
  },
  friendBadge: {
    backgroundColor: COLORS.peachBadgeBg,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  friendBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.peachBadgeText,
    letterSpacing: 0.5,
    fontFamily: fontFamily.accent,
  },
  reportMeta: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.body,
  },
  reportWaitTime: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 0,
    fontFamily: fontFamily.display,
  },

  // ── Vibe tags ──
  vibeSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vibeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.mutedForeground,
    fontFamily: fontFamily.bodySemiBold,
  },

  // ── Sticky bottom ──
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: 'rgba(251,251,252,0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stickyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  stickyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
})
