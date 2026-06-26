import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polyline, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import {
  MapPin, Navigation, Clock, Calendar, MessageSquare, User, X,
  ChevronLeft, ChevronRight, Star, Camera,
} from 'lucide-react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { venues, severityColor, type VenueReview, type VenueReport } from '@/lib/mock-data'
import { fontFamily } from '@/constants/theme'
import { openDirections } from '@/lib/actions'
import { ReviewModal } from '@/components/ReviewModal'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const C = {
  bg: '#FCFBF9',
  primary: '#F8682B',
  foreground: '#33384A',
  muted: '#857565',
  border: '#EDE6DD',
  card: '#FFFFFF',
  peach: '#FFF0E8',
  peachText: '#F8682B',
}

const AVATAR_COLORS = ['#5DB18A', '#D69A3F', '#F8682B', '#857565', '#33384A']

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
        <SvgGradient id="sheet-sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.28} />
          <Stop offset="1" stopColor={color} stopOpacity={0.0} />
        </SvgGradient>
      </Defs>
      <Path d={areaD} fill="url(#sheet-sg)" />
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

function StarRow({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          color="#F59E0B"
          fill={i <= count ? '#F59E0B' : 'transparent'}
          strokeWidth={2}
        />
      ))}
    </View>
  )
}

function ReviewCard({ review }: { review: VenueReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.name}</Text>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>{review.source}</Text>
        </View>
        <Text style={styles.reviewAgo}>{review.ago}</Text>
      </View>
      <StarRow count={review.stars} size={11} />
      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  )
}

function ReportCard({ report, index }: { report: VenueReport; index: number }) {
  const waitColor =
    report.waitMinutes > 45
      ? '#D9462E'
      : report.waitMinutes > 15
      ? '#D69A3F'
      : '#5DB18A'

  return (
    <View style={[styles.reportCard, index > 0 && { marginTop: 8 }]}>
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
          <User size={14} color={C.muted} strokeWidth={2} />
        </View>
      )}
      <View style={styles.reportContent}>
        <View style={styles.reportNameRow}>
          <Text
            style={[
              styles.reportName,
              !report.isFriend && { fontWeight: '400', color: C.muted },
            ]}
          >
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
      <Text style={[styles.reportWaitTime, { color: waitColor }]}>
        {`${report.waitMinutes}m`}
      </Text>
    </View>
  )
}

export const VenueSheet = forwardRef<BottomSheet, {
  venueId: string | null
  onClose: () => void
}>(({ venueId, onClose }, ref) => {
  const snapPoints = useMemo(() => ['75%', '100%'], [])
  const [displayVenueId, setDisplayVenueId] = useState<string | null>(null)
  const [photoIdx, setPhotoIdx] = useState<number>(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (venueId) {
      setDisplayVenueId(venueId)
    }
  }, [venueId])

  const venue = venues.find(v => v.id === displayVenueId) ?? null

  async function handleAddPhoto() {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
  }

  const liveColor = venue ? severityColor(venue.severity) : '#999'
  const liveLabelText = !venue
    ? ''
    : venue.severity === 'short'
    ? 'SHORT LINE'
    : venue.severity === 'moderate'
    ? 'MODERATE LINE'
    : 'LONG LINE'

  const photos = venue?.photos ?? []
  const totalPhotos = photos.length

  function handlePrevPhoto() {
    setPhotoIdx(prev => (prev > 0 ? prev - 1 : totalPhotos - 1))
  }
  function handleNextPhoto() {
    setPhotoIdx(prev => (prev < totalPhotos - 1 ? prev + 1 : 0))
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
    ),
    [],
  )

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableContentPanningGesture={false}
      backgroundStyle={{ borderRadius: 24, backgroundColor: C.bg }}
      handleIndicatorStyle={{ backgroundColor: C.primary, width: 40 }}
      backdropComponent={renderBackdrop}
      onChange={(index) => {
        if (index === -1) {
          onClose()
          setPhotoIdx(0)
          setTimeout(() => setDisplayVenueId(null), 200)
        }
      }}
    >
      {venue ? <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero image with photo carousel */}
        <View style={styles.hero}>
          <Image
            source={{ uri: photos[photoIdx] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.78)']}
            style={styles.heroGradient}
          />

          {/* Carousel arrows */}
          {totalPhotos > 1 ? (
            <>
              <Pressable style={[styles.carouselArrow, styles.carouselArrowLeft]} onPress={handlePrevPhoto}>
                <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
              <Pressable style={[styles.carouselArrow, styles.carouselArrowRight]} onPress={handleNextPhoto}>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </>
          ) : null}

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose} testID="venue-sheet-close">
            <X size={16} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>

          {/* Dot indicators */}
          {totalPhotos > 1 ? (
            <View style={styles.dotRow}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === photoIdx ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          ) : null}

          {/* Hero bottom info */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroVibeTags}>
              {`${venue.categoryLabel.toUpperCase()} · ${venue.vibe.toUpperCase()}`}
            </Text>
            <Text style={styles.heroName}>{venue.name}</Text>
            <View style={styles.heroAddressRow}>
              <MapPin size={10} color="rgba(255,255,255,0.85)" strokeWidth={2} />
              <Text style={styles.heroAddress}>{venue.address}</Text>
            </View>
          </View>
        </View>

        {/* 2. Action row */}
        <View style={styles.actionRow}>
          <Pressable style={styles.actionPillSecondary} onPress={() => openDirections(venue.lat, venue.lng, venue.name)}>
            <Navigation size={15} color={C.foreground} strokeWidth={2} />
            <Text style={styles.actionPillSecondaryText}>Directions</Text>
          </Pressable>
          <Pressable
            style={styles.actionPillPrimary}
            onPress={() => {
              router.push({ pathname: '/(tabs)/report', params: { venueId: venue.id } })
            }}
          >
            <Clock size={15} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionPillPrimaryText}>Report wait</Text>
          </Pressable>
        </View>

        {/* 3. Live Wait card */}
        <View style={styles.section}>
          <View style={styles.liveWaitCard}>
            <View style={styles.liveWaitTopRow}>
              <Text style={styles.liveWaitLabel}>LIVE WAIT</Text>
              <Sparkline color={liveColor} />
            </View>
            <View style={styles.liveWaitNumRow}>
              <Text style={[styles.liveWaitNumber, { color: liveColor }]}>
                {venue.waitMinutes}
              </Text>
              <Text style={styles.liveWaitUnit}>min</Text>
            </View>
            <View style={styles.liveWaitBottomRow}>
              <Text style={[styles.liveWaitSeverity, { color: liveColor }]}>
                {liveLabelText}
              </Text>
              <View style={styles.liveWaitUpdatedRow}>
                <Clock size={11} color={C.muted} strokeWidth={2} />
                <Text style={styles.liveWaitUpdated}>
                  {`Updated ${venue.lastReportMinutes}m ago`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Driving the crowd */}
        {venue.event ? (
          <View style={styles.section}>
            <View style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Calendar size={14} color={C.primary} strokeWidth={2} />
                <Text style={styles.eventLabel}>DRIVING THE CROWD</Text>
              </View>
              <Text style={styles.eventName}>{venue.event}</Text>
            </View>
          </View>
        ) : null}

        {/* 5. Stats row */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Clock size={14} color={C.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{`${venue.typicalWaitMinutes}m`}</Text>
              <Text style={styles.statLabel}>AVG WAIT</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMiddle]}>
              <MessageSquare size={14} color={C.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{venue.reportsCount}</Text>
              <Text style={styles.statLabel}>REPORTS</Text>
            </View>
            <View style={styles.statBox}>
              <Clock size={14} color={C.primary} strokeWidth={2} />
              <Text style={styles.statValue}>{venue.hours}</Text>
              <Text style={styles.statLabel}>OPEN</Text>
            </View>
          </View>
        </View>

        {/* 6. Reviews section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <View style={styles.reviewsTitleRow}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                <Text style={styles.ratingText}>
                  {venue.averageRating.toFixed(1)} · {venue.reviews.length}
                </Text>
              </View>
            </View>
            <Text style={styles.reviewsSubtitle}>Pulled from Google · plus the community</Text>
          </View>

          <View style={styles.reviewButtonsRow}>
            <Pressable style={styles.reviewBtnPrimary} onPress={() => setReviewOpen(true)}>
              <Star size={13} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.reviewBtnPrimaryText}>Write a review</Text>
            </Pressable>
            <Pressable style={styles.reviewBtnSecondary} onPress={handleAddPhoto}>
              <Camera size={13} color={C.foreground} strokeWidth={2} />
              <Text style={styles.reviewBtnSecondaryText}>Add photo</Text>
            </Pressable>
          </View>

          <View style={styles.reviewsList}>
            {venue.reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        </View>

        {/* 7. Recent reports section */}
        <View style={styles.section}>
          <View style={styles.reportsHeaderRow}>
            <Text style={styles.sectionTitle}>Recent reports</Text>
            <Text style={styles.reportsHeaderNote}>Names shown for friends only</Text>
          </View>
          <View style={styles.reportsList}>
            {venue.recentReports.map((report, index) => (
              <ReportCard key={report.id} report={report} index={index} />
            ))}
          </View>
        </View>

        {/* 8. Vibe tags */}
        <View style={styles.section}>
          <View style={styles.vibeTagsRow}>
            <View style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{venue.vibe}</Text>
            </View>
            <View style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{venue.categoryLabel}</Text>
            </View>
            {venue.priceRange ? (
              <View style={styles.vibeTag}>
                <Text style={styles.vibeTagText}>{venue.priceRange}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </BottomSheetScrollView> : null}
      <ReviewModal visible={reviewOpen} venueName={venue?.name ?? ''} onClose={() => setReviewOpen(false)} />
    </BottomSheet>
  )
})

VenueSheet.displayName = 'VenueSheet'

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero
  hero: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '30%',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Carousel arrows
  carouselArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  carouselArrowLeft: {
    left: 10,
  },
  carouselArrowRight: {
    right: 48,
  },

  // Dot indicators
  dotRow: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    zIndex: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroVibeTags: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.0,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 6,
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

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  actionPillSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPillSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  actionPillPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  actionPillPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.foreground,
    fontFamily: fontFamily.display,
  },

  // Live Wait card
  liveWaitCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.muted,
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
    fontSize: 54,
    fontWeight: '800',
    lineHeight: 58,
    letterSpacing: -2,
    fontFamily: fontFamily.displayBold,
  },
  liveWaitUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: C.muted,
    paddingBottom: 6,
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
    color: C.muted,
    fontWeight: '500',
    fontFamily: fontFamily.body,
  },

  // Event card
  eventCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.foreground,
    fontFamily: fontFamily.display,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 0,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
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
    fontSize: 14,
    fontWeight: '700',
    color: C.foreground,
    textAlign: 'center',
    fontFamily: fontFamily.display,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },

  // Reviews section
  reviewsHeader: {
    marginBottom: 12,
  },
  reviewsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.foreground,
    fontFamily: fontFamily.body,
  },
  reviewsSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
    fontFamily: fontFamily.body,
  },
  reviewButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  reviewBtnPrimary: {
    flex: 1,
    height: 40,
    borderRadius: 9999,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },
  reviewBtnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },
  reviewsList: {
    gap: 8,
  },
  reviewCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.foreground,
    fontFamily: fontFamily.display,
  },
  sourceBadge: {
    backgroundColor: C.peach,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.peachText,
    letterSpacing: 0.5,
    fontFamily: fontFamily.accent,
  },
  reviewAgo: {
    fontSize: 11,
    color: C.muted,
    marginLeft: 'auto',
    fontFamily: fontFamily.body,
  },
  reviewText: {
    fontSize: 13,
    color: C.foreground,
    lineHeight: 19,
    fontFamily: fontFamily.body,
  },

  // Recent reports header
  reportsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reportsHeaderNote: {
    fontSize: 10,
    color: C.muted,
    fontFamily: fontFamily.body,
  },

  // Recent reports
  reportsList: {},
  reportCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.foreground,
    fontFamily: fontFamily.display,
  },
  friendBadge: {
    backgroundColor: C.peach,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  friendBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.peachText,
    letterSpacing: 0.5,
    fontFamily: fontFamily.accent,
  },
  reportMeta: {
    fontSize: 11,
    color: C.muted,
    fontFamily: fontFamily.body,
  },
  reportWaitTime: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 0,
    fontFamily: fontFamily.display,
  },

  // Vibe tags
  vibeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeTag: {
    backgroundColor: C.peach,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  vibeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.peachText,
    fontFamily: fontFamily.bodySemiBold,
  },
})
