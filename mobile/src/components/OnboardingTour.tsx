import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapPin, Map, Users, Trophy, X } from 'lucide-react-native'
import { shadows, fontFamily } from '@/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_BG = '#FFFFFF'
const BORDER = '#EDE6DD'
const PRIMARY = '#F8682B'
const FG = '#33384A'
const MUTED = '#857565'
const TAB_BAR_HEIGHT = 84

// ─── Step type ────────────────────────────────────────────────────────────────

interface TourStep {
  title: string
  body: string
  iconComponent: React.ReactNode
  anchor: number | null
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to SkipTheLine',
    body: 'Live, crowd-powered wait times for restaurants, clubs, barbers, and more. Tap any venue to see the full story.',
    iconComponent: <MapPin size={22} color="#FFFFFF" strokeWidth={2} />,
    anchor: null,
  },
  {
    title: 'See the city at a glance',
    body: 'Open the Map to spot short lines near you in real time.',
    iconComponent: <Map size={22} color="#FFFFFF" strokeWidth={2} />,
    anchor: 0.30,
  },
  {
    title: 'Drop a wait, earn points',
    body: 'Tap the center button to report a line in seconds — climb the ranks every time you contribute.',
    iconComponent: <Users size={22} color="#FFFFFF" strokeWidth={2} />,
    anchor: 0.50,
  },
  {
    title: 'Track your rank & badges',
    body: 'Your profile keeps score of every report and unlocks badges as you level up.',
    iconComponent: <Trophy size={22} color="#FFFFFF" strokeWidth={2} />,
    anchor: 0.90,
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingTourProps {
  visible: boolean
  onDismiss: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingTour({ visible, onDismiss }: OnboardingTourProps) {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<number>(0)
  const translateY = useRef(new Animated.Value(200)).current

  const CARD_HORIZONTAL_PAD = 20
  const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PAD * 2

  useEffect(() => {
    if (visible) {
      setStep(0)
      translateY.setValue(200)
      Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 160, mass: 1, useNativeDriver: true }).start()
    }
  }, [visible])

  const animatedStyle = { transform: [{ translateY }] }

  function dismiss() {
    Animated.timing(translateY, { toValue: 280, duration: 200, useNativeDriver: true }).start(() => onDismiss())
  }

  function advance() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  function handleBackdropPress() {
    advance()
  }

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1
  const bottomInset = insets.bottom

  // Arrow horizontal position clamped to card bounds
  const ARROW_SIZE = 12
  const ARROW_MIN = CARD_HORIZONTAL_PAD + 16
  const ARROW_MAX = CARD_HORIZONTAL_PAD + CARD_WIDTH - 16
  const arrowLeft = currentStep.anchor !== null
    ? Math.max(ARROW_MIN, Math.min(ARROW_MAX, currentStep.anchor * SCREEN_WIDTH - ARROW_SIZE / 2))
    : SCREEN_WIDTH / 2 - ARROW_SIZE / 2

  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      testID="onboarding-tour-modal"
    >
      {/* Backdrop — tap to advance */}
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
        testID="tour-backdrop"
      />

      {/* Card + Arrow container */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            bottom: TAB_BAR_HEIGHT + bottomInset,
          },
          animatedStyle,
        ]}
        testID="tour-card-container"
      >
        {/* Card */}
        <View style={styles.card} testID={`tour-step-${step}`}>

          {/* Eyebrow row with X button */}
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>
              {`STEP ${step + 1} OF ${STEPS.length}`}
            </Text>
            <Pressable
              style={styles.closeBtn}
              onPress={dismiss}
              testID="tour-close-btn"
            >
              <X size={14} color={MUTED} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Icon tile */}
          <View style={styles.iconTile}>
            {currentStep.iconComponent}
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentStep.title}</Text>

          {/* Body */}
          <Text style={styles.body}>{currentStep.body}</Text>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={i === step ? styles.dotActive : styles.dotInactive}
              />
            ))}
          </View>

          {/* Button row */}
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.btnSkip}
              onPress={dismiss}
              testID="tour-skip-btn"
            >
              <Text style={styles.btnSkipText}>Skip</Text>
            </Pressable>
            <Pressable
              style={styles.btnNext}
              onPress={advance}
              testID="tour-next-btn"
            >
              <Text style={styles.btnNextText}>
                {isLast ? "Got it — let's go" : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Arrow diamond pointing down at tab bar */}
        {currentStep.anchor !== null ? (
          <View
            style={[
              styles.arrow,
              { left: arrowLeft - CARD_HORIZONTAL_PAD },
            ]}
            testID="tour-arrow"
          />
        ) : null}
      </Animated.View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 26,
    padding: 20,
    ...shadows.elevated,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fontFamily.accent,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8682B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: FG,
    marginBottom: 6,
    letterSpacing: -0.2,
    fontFamily: fontFamily.display,
  },
  body: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: fontFamily.body,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F8682B',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BORDER,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSkip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSkipText: {
    fontSize: 14,
    fontWeight: '600',
    color: MUTED,
    fontFamily: fontFamily.bodySemiBold,
  },
  btnNext: {
    flex: 2,
    borderRadius: 999,
    backgroundColor: '#F8682B',
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: 'rgba(99,102,241,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  btnNextText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontFamily.display,
  },
  arrow: {
    width: 12,
    height: 12,
    backgroundColor: CARD_BG,
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER,
    marginTop: -6,
    alignSelf: 'flex-start',
  },
})
