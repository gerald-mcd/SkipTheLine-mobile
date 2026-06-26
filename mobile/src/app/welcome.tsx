import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin } from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

const SLIDES = [
  { category: 'Restaurants',   wait: '42m', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=85' },
  { category: 'Barbershops',   wait: '8m',  image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=85' },
  { category: 'Grocery',       wait: '12m', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=85' },
  { category: 'Government',    wait: '95m', image: 'https://images.unsplash.com/photo-1568745468016-b8da6b4e2dc2?w=900&q=85' },
  { category: 'Healthcare',    wait: '110m',image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=85' },
  { category: 'Retail',        wait: '18m', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85' },
  { category: 'Entertainment', wait: '65m', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=900&q=85' },
  { category: 'Landmarks',     wait: '30m', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=85' },
  { category: 'Attractions',   wait: '45m', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85' },
]

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [slideIndex, setSlideIndex] = useState(0)

  // Per-slide animated values
  const fadeAnims = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current
  const scaleAnims = useRef(SLIDES.map(() => new Animated.Value(1.0))).current

  // Content entrance anims
  const contentOpacity  = useRef(new Animated.Value(0)).current
  const contentTranslate = useRef(new Animated.Value(12)).current
  const eyebrowOpacity  = useRef(new Animated.Value(0)).current
  const eyebrowTranslate = useRef(new Animated.Value(12)).current
  const h1Opacity       = useRef(new Animated.Value(0)).current
  const h1Translate     = useRef(new Animated.Value(12)).current
  const subOpacity      = useRef(new Animated.Value(0)).current
  const subTranslate    = useRef(new Animated.Value(12)).current
  const btnsOpacity     = useRef(new Animated.Value(0)).current
  const btnsTranslate   = useRef(new Animated.Value(12)).current

  const eyebrowText = `${SLIDES[slideIndex].category} · ${SLIDES[slideIndex].wait} wait now`

  useEffect(() => {
    // Entrance stagger
    Animated.stagger(60, [
      Animated.parallel([
        Animated.timing(contentOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(eyebrowOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(eyebrowTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(h1Opacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(h1Translate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(subTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnsOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btnsTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  useEffect(() => {
    // Ken-Burns on active slide
    Animated.timing(scaleAnims[slideIndex], {
      toValue: 1.06,
      duration: 6000,
      useNativeDriver: true,
    }).start()

    const interval = setInterval(() => {
      const next = (slideIndex + 1) % SLIDES.length
      // Fade out current
      Animated.timing(fadeAnims[slideIndex], {
        toValue: 0,
        duration: 1600,
        useNativeDriver: true,
      }).start()
      // Fade in next
      Animated.timing(fadeAnims[next], {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }).start()
      // Reset scale on old, start new
      scaleAnims[slideIndex].setValue(1.0)
      scaleAnims[next].setValue(1.0)
      Animated.timing(scaleAnims[next], {
        toValue: 1.06,
        duration: 6000,
        useNativeDriver: true,
      }).start()
      setSlideIndex(next)
    }, 4200)

    return () => clearInterval(interval)
  }, [slideIndex])

  const handleContinue = async () => {
    await AsyncStorage.setItem('stl:entered-app', '1')
    await AsyncStorage.removeItem('stl:tour-seen')
    router.replace('/(tabs)')
  }

  return (
    <View style={styles.container}>
      {/* Background carousel */}
      {SLIDES.map((slide, i) => (
        <Animated.View
          key={i}
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: fadeAnims[i] },
          ]}
        >
          <Animated.Image
            source={{ uri: slide.image }}
            style={[styles.bgImage, { transform: [{ scale: scaleAnims[i] }] }]}
            resizeMode="cover"
          />
        </Animated.View>
      ))}

      {/* Overlay gradient */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.55)',
          'rgba(0,0,0,0.40)',
          'rgba(0,0,0,0.85)',
        ]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content — bottom anchored */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>

        {/* Brand row */}
        <Animated.View
          style={[
            styles.brandRow,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] },
          ]}
        >
          <View style={styles.logoTile}>
            <MapPin size={18} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.wordmark}>SkipTheLine</Text>
        </Animated.View>

        {/* Eyebrow */}
        <Animated.View
          style={[
            styles.eyebrowRow,
            { opacity: eyebrowOpacity, transform: [{ translateY: eyebrowTranslate }] },
          ]}
        >
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>{eyebrowText.toUpperCase()}</Text>
        </Animated.View>

        {/* H1 */}
        <Animated.Text
          style={[
            styles.h1,
            { opacity: h1Opacity, transform: [{ translateY: h1Translate }] },
          ]}
        >
          {'Know the wait\n'}
          <Text style={styles.h1Accent}>before you go.</Text>
        </Animated.Text>

        {/* Subhead */}
        <Animated.Text
          style={[
            styles.subhead,
            { opacity: subOpacity, transform: [{ translateY: subTranslate }] },
          ]}
        >
          Live, crowd-powered wait times for restaurants, clubs, barbers, landmarks — anywhere you'd rather not stand in line.
        </Animated.Text>

        {/* Auth buttons */}
        <Animated.View
          style={[
            styles.buttonsBlock,
            { opacity: btnsOpacity, transform: [{ translateY: btnsTranslate }] },
          ]}
        >
          {/* Email CTA */}
          <Pressable
            testID="btn-continue-email"
            style={({ pressed }) => [styles.btnEmail, pressed && { opacity: 0.88 }]}
            onPress={handleContinue}
          >
            <Text style={styles.btnEmailText}>Continue with email</Text>
          </Pressable>

          {/* Google */}
          <Pressable
            testID="btn-continue-google"
            style={({ pressed }) => [styles.btnSocial, pressed && { opacity: 0.75 }]}
            onPress={handleContinue}
          >
            <Text style={styles.btnSocialIcon}>G</Text>
            <Text style={styles.btnSocialText}>Continue with Google</Text>
          </Pressable>

          {/* Apple */}
          <Pressable
            testID="btn-continue-apple"
            style={({ pressed }) => [styles.btnSocial, pressed && { opacity: 0.75 }]}
            onPress={handleContinue}
          >
            <Text style={styles.btnSocialIcon}></Text>
            <Text style={styles.btnSocialText}>Continue with Apple</Text>
          </Pressable>
        </Animated.View>

        {/* Legal */}
        <Text style={styles.legal}>By continuing you agree to the Terms &amp; Privacy.</Text>

        {/* Slide indicators */}
        <View style={styles.indicators}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.indicator, i === slideIndex ? styles.indicatorActive : styles.indicatorInactive]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    width,
    height,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8682B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    fontFamily: fontFamily.displayBold,
  },

  // Eyebrow
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F2934D',
    shadowColor: '#F2934D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.18 * 11,
    fontFamily: fontFamily.accent,
  },

  // H1
  h1: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44 * 0.95,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 24,
    fontFamily: fontFamily.displayBold,
  },
  h1Accent: {
    color: '#F2934D',
  },

  // Subhead
  subhead: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    maxWidth: 320,
    fontFamily: fontFamily.body,
  },

  // Buttons
  buttonsBlock: {
    gap: 10,
    marginTop: 4,
  },
  btnEmail: {
    backgroundColor: '#F8682B',
    height: 48,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F8682B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  btnEmailText: {
    color: '#FFFCF7',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: fontFamily.bodySemiBold,
  },
  btnSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    gap: 8,
  },
  btnSocialIcon: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSocialText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },

  // Legal
  legal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },

  // Indicators
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  indicatorActive: {
    width: 18,
    backgroundColor: '#F2934D',
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
})
