import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable, Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polyline, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import {
  Search, SlidersHorizontal, MapPin, Users, Plus, Minus, Navigation, Map,
  Star, Camera, Calendar, MessageSquare, User, X, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/theme'
import { venues, getWaitColor, severityColor, type VenueReview, type VenueReport } from '@/lib/mock-data'
import { openDirections } from '@/lib/actions'
import { ReviewModal } from '@/components/ReviewModal'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const C = {
  bg: '#FFFFFF',
  primary: '#E07A3B',
  foreground: '#33384A',
  muted: '#857565',
  border: '#EDE6DD',
  card: '#FFFFFF',
  peach: '#FFF0E8',
  peachText: '#E07A3B',
}

const AVATAR_COLORS = ['#5DB18A', '#D69A3F', '#E07A3B', '#857565', '#33384A']

const SPARK_DATA = [22, 35, 55, 70, 78, 60, 42, 28]
const SPARK_W = 80
const SPARK_H = 36

const lightMapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

const sortedVenues = [...venues].sort((a, b) => b.liveReporters - a.liveReporters)

/* ------------------------------------------------------------------ */
/*  Helper components (from VenueSheet)                               */
/* ------------------------------------------------------------------ */

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
          {`${report.type} \u00B7 ${report.agoText}`}
        </Text>
      </View>
      <Text style={[styles.reportWaitTime, { color: waitColor }]}>
        {`${report.waitMinutes}m`}
      </Text>
    </View>
  )
}

/* ------------------------------------------------------------------ */
/*  Main screen                                                       */
/* ------------------------------------------------------------------ */

export default function MapScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const mapRef = useRef<MapView>(null)
  const sheetRef = useRef<BottomSheet>(null)

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [displayVenueId, setDisplayVenueId] = useState<string | null>(null)
  const [photoIdx, setPhotoIdx] = useState<number>(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard')
  const [filterActive, setFilterActive] = useState(false)

  useEffect(() => {
    if (selectedVenueId) {
      setDisplayVenueId(selectedVenueId)
    }
  }, [selectedVenueId])

  async function handleAddPhoto() {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
  }

  const filteredVenues = useMemo(() => {
    if (!filterActive) return sortedVenues
    return sortedVenues.filter(v => v.severity === 'short')
  }, [filterActive])

  const listSnapPoints = useMemo(() => ['40%', '85%'], [])
  const detailSnapPoints = useMemo(() => ['75%', '100%'], [])
  const snapPoints = selectedVenueId ? detailSnapPoints : listSnapPoints

  const selectedVenue = useMemo(
    () => {
      const id = displayVenueId ?? selectedVenueId
      return id ? venues.find(v => v.id === id) ?? null : null
    },
    [selectedVenueId, displayVenueId],
  )

  const liveColor = selectedVenue ? severityColor(selectedVenue.severity) : '#999'
  const liveLabelText = !selectedVenue
    ? ''
    : selectedVenue.severity === 'short'
    ? 'SHORT LINE'
    : selectedVenue.severity === 'moderate'
    ? 'MODERATE LINE'
    : 'LONG LINE'

  const photos = selectedVenue?.photos ?? []
  const totalPhotos = photos.length

  const openVenueDetail = useCallback((venueId: string) => {
    setSelectedVenueId(venueId)
    setPhotoIdx(0)
    // Snap to the first detail snap point after a brief delay so snapPoints update
    setTimeout(() => {
      sheetRef.current?.snapToIndex(0)
    }, 50)
  }, [])

  const closeVenueDetail = useCallback(() => {
    setSelectedVenueId(null)
    setPhotoIdx(0)
    setTimeout(() => {
      sheetRef.current?.snapToIndex(0)
    }, 100)
    setTimeout(() => setDisplayVenueId(null), 400)
  }, [])

  function handlePrevPhoto() {
    setPhotoIdx(prev => (prev > 0 ? prev - 1 : totalPhotos - 1))
  }
  function handleNextPhoto() {
    setPhotoIdx(prev => (prev < totalPhotos - 1 ? prev + 1 : 0))
  }

  const handleZoomIn = useCallback(() => {
    mapRef.current?.getCamera().then((camera) => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({ zoom: camera.zoom + 1 }, { duration: 200 })
      }
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.getCamera().then((camera) => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({ zoom: camera.zoom - 1 }, { duration: 200 })
      }
    })
  }, [])

  const handleLocate = useCallback(() => {
    mapRef.current?.animateToRegion({
      latitude: 25.7617,
      longitude: -80.1918,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 400)
  }, [])

  /* ---------------------------------------------------------------- */
  /*  Render: Detail view inside BottomSheet                          */
  /* ---------------------------------------------------------------- */
  function renderDetailView() {
    if (!selectedVenue) return null
    const venue = selectedVenue
    return (
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back button */}
        <Pressable style={styles.detailBackRow} onPress={closeVenueDetail} testID="venue-detail-back">
          <ChevronLeft size={20} color={C.foreground} strokeWidth={2.5} />
          <Text style={styles.detailBackText}>Back to list</Text>
        </Pressable>

        {/* 1. Hero image with photo carousel */}
        <View style={styles.hero}>
          <Image
            source={{ uri: photos[photoIdx] }}
            style={styles.heroImage}
            contentFit="cover"
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
          <Pressable style={styles.closeBtn} onPress={closeVenueDetail} testID="venue-sheet-close">
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
              {`${venue.categoryLabel.toUpperCase()} \u00B7 ${venue.vibe.toUpperCase()}`}
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
                  {venue.averageRating.toFixed(1)} \u00B7 {venue.reviews.length}
                </Text>
              </View>
            </View>
            <Text style={styles.reviewsSubtitle}>Pulled from Google \u00B7 plus the community</Text>
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
      </BottomSheetScrollView>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Render: List view inside BottomSheet                            */
  /* ---------------------------------------------------------------- */
  function renderListView() {
    return (
      <>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{filteredVenues.length} places nearby</Text>
          <Text style={styles.sheetSub}>
            All categories \u00B7 <Text style={styles.sheetSubBold}>trending</Text>
          </Text>
        </View>
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}
        >
          {filteredVenues.map(venue => (
            <Pressable
              key={venue.id}
              style={styles.venueRow}
              onPress={() => openVenueDetail(venue.id)}
              testID={`venue-row-${venue.id}`}
            >
              <Image
                source={{ uri: venue.image }}
                style={styles.venueImage}
                contentFit="cover"
              />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
                <View style={styles.venueMeta}>
                  <MapPin size={11} color={C.muted} />
                  <Text style={styles.venueMetaText}>{venue.distance}</Text>
                  <Users size={11} color={C.muted} style={{ marginLeft: 8 }} />
                  <Text style={styles.venueMetaText}>{venue.liveReporters}</Text>
                </View>
              </View>
              <View style={[styles.waitPill, { backgroundColor: getWaitColor(venue.severity) }]}>
                <Text style={styles.waitPillText}>{venue.waitMinutes} min</Text>
              </View>
            </Pressable>
          ))}
          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 25.7617,
          longitude: -80.1918,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        mapType={mapStyle}
        customMapStyle={mapStyle === 'standard' ? lightMapStyle : undefined}
      >
        {venues.map(venue => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            onPress={() => openVenueDetail(venue.id)}
          >
            <View style={[styles.pin, { backgroundColor: getWaitColor(venue.severity) }]}>
              <Text style={styles.pinText}>{venue.waitMinutes}m</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={[styles.searchBar, { top: insets.top + 12 }]}>
        <Pressable style={styles.searchInner} onPress={() => { setSelectedVenueId(null); setTimeout(() => sheetRef.current?.snapToIndex(1), 50) }}>
          <View style={styles.searchIconWrap}>
            <Search size={16} color={C.primary} />
          </View>
          <Text style={styles.searchPlaceholder}>Search venues, food, vibes...</Text>
        </Pressable>
        <Pressable style={[styles.filterBtn, filterActive && { backgroundColor: C.foreground }]} testID="map-filter-btn" onPress={() => setFilterActive(prev => !prev)}>
          <SlidersHorizontal size={16} color="#fff" />
        </Pressable>
      </View>

      {/* Right-side controls */}
      <View style={[styles.controls, { top: insets.top + 80 }]}>
        <Pressable style={styles.controlBtn} onPress={handleZoomIn} testID="zoom-in-btn">
          <Plus size={18} color={C.foreground} />
        </Pressable>
        <Pressable style={styles.controlBtn} onPress={handleZoomOut} testID="zoom-out-btn">
          <Minus size={18} color={C.foreground} />
        </Pressable>
        <Pressable style={styles.controlBtn} onPress={handleLocate} testID="locate-btn">
          <Navigation size={18} color={C.foreground} />
        </Pressable>
        <View style={styles.controlDivider} />
        <Pressable style={[styles.controlBtn, styles.controlBtnPrimary]} testID="map-toggle-btn" onPress={() => setMapStyle(prev => prev === 'standard' ? 'satellite' : 'standard')}>
          <Map size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Single unified BottomSheet */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        {displayVenueId ? renderDetailView() : renderListView()}
      </BottomSheet>
      <ReviewModal visible={reviewOpen} venueName={selectedVenue?.name ?? ''} onClose={() => setReviewOpen(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  map: { flex: 1 },

  pin: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  searchBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconWrap: { width: 20, alignItems: 'center' },
  searchPlaceholder: { fontSize: 14, color: '#B0A898', flex: 1 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  controls: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  controlBtnPrimary: {
    backgroundColor: C.primary,
  },
  controlDivider: {
    width: 24,
    height: 1,
    backgroundColor: C.border,
  },

  /* BottomSheet chrome */
  sheetBg: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  sheetHandle: {
    backgroundColor: C.primary,
    width: 40,
    height: 4,
  },

  /* List view */
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.foreground,
    fontFamily: fontFamily.display,
  },
  sheetSub: {
    fontSize: 12,
    color: C.muted,
  },
  sheetSubBold: {
    fontWeight: '700',
    color: C.foreground,
  },
  sheetList: {
    paddingHorizontal: 16,
    gap: 4,
  },

  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  venueImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: C.border,
  },
  venueInfo: {
    flex: 1,
    gap: 4,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.foreground,
  },
  venueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  venueMetaText: {
    fontSize: 12,
    color: C.muted,
  },

  waitPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  waitPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Detail view - back row */
  detailBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  detailBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.foreground,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* Detail view - scroll content */
  scrollContent: {
    paddingBottom: 20,
  },

  /* Hero */
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

  /* Carousel arrows */
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

  /* Dot indicators */
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

  /* Action row */
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

  /* Section */
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

  /* Live Wait card */
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

  /* Event card */
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

  /* Stats row */
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

  /* Reviews section */
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

  /* Recent reports header */
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

  /* Recent reports */
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

  /* Vibe tags */
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
