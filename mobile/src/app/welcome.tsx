import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin } from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { signInAsTestUser } from '@/lib/auth'

const { width, height } = Dimensions.get('window')

// ─── Slides ───────────────────────────────────────────────────────────────────

const SLIDES = [
  { label: 'Restaurants · 42m wait now',   image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Barbershops · 8m wait now',    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Grocery · 12m wait now',       image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Government · 95m wait now',    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Healthcare · 110m wait now',   image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Retail · 18m wait now',        image: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Entertainment · 65m wait now', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Landmarks · 30m wait now',     image: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Attractions · 45m wait now',   image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop' },
]

// ─── Tokens ───────────────────────────────────────────────────────────────────

const PRIMARY      = '#F8682B'
const PRIMARY_GLOW = '#FFB37A'

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const [slideIndex, setSlideIndex] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)

  // Per-slide animated values
  const fadeAnims  = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current
  const scaleAnims = useRef(SLIDES.map(() => new Animated.Value(1.0))).current

  // Content stagger anims
  const brandAnim   = useRef(new Animated.Value(0)).current
  const brandTY     = useRef(new Animated.Value(12)).current
  const eyebrowAnim = useRef(new Animated.Value(0)).current
  const eyebrowTY   = useRef(new Animated.Value(12)).current
  const h1Anim      = useRef(new Animated.Value(0)).current
  const h1TY        = useRef(new Animated.Value(12)).current
  const subAnim     = useRef(new Animated.Value(0)).current
  const subTY       = useRef(new Animated.Value(12)).current
  const btnsAnim    = useRef(new Animated.Value(0)).current
  const btnsTY      = useRef(new Animated.Value(12)).current

  // No session detection — always start on welcome screen
  // User must explicitly tap a button to enter the app

  // ── Entrance animation ──────────────────────────────────────────────────────

  useEffect(() => {
    const dur = 500
    const ease = { useNativeDriver: true }
    const fadeUp = (opac: Animated.Value, ty: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opac, { toValue: 1, duration: dur, ...ease }),
          Animated.timing(ty,   { toValue: 0, duration: dur, ...ease }),
        ]),
      ])

    Animated.parallel([
      fadeUp(brandAnim,   brandTY,   0),
      fadeUp(eyebrowAnim, eyebrowTY, 60),
      fadeUp(h1Anim,      h1TY,      120),
      fadeUp(subAnim,     subTY,     180),
      fadeUp(btnsAnim,    btnsTY,    240),
    ]).start()
  }, [])

  // ── Slide carousel ──────────────────────────────────────────────────────────

  useEffect(() => {
    // Ken Burns on first slide
    Animated.timing(scaleAnims[0], { toValue: 1.06, duration: 6000, useNativeDriver: true }).start()

    const interval = setInterval(() => {
      setSlideIndex(prev => {
        const next = (prev + 1) % SLIDES.length

        // Crossfade 1600ms
        Animated.timing(fadeAnims[prev], { toValue: 0, duration: 1600, useNativeDriver: true }).start()
        Animated.timing(fadeAnims[next], { toValue: 1, duration: 1600, useNativeDriver: true }).start()

        // Ken Burns reset + animate next
        scaleAnims[prev].setValue(1.0)
        scaleAnims[next].setValue(1.0)
        Animated.timing(scaleAnims[next], { toValue: 1.06, duration: 6000, useNativeDriver: true }).start()

        return next
      })
    }, 4200)

    return () => clearInterval(interval)
  }, [])

  function jumpToSlide(i: number) {
    if (i === slideIndex) return
    Animated.timing(fadeAnims[slideIndex], { toValue: 0, duration: 400, useNativeDriver: true }).start()
    scaleAnims[i].setValue(1.0)
    Animated.parallel([
      Animated.timing(fadeAnims[i],   { toValue: 1,    duration: 400,  useNativeDriver: true }),
      Animated.timing(scaleAnims[i],  { toValue: 1.06, duration: 6000, useNativeDriver: true }),
    ]).start()
    setSlideIndex(i)
  }

  // ── Auth handlers ───────────────────────────────────────────────────────────

  const handleTestUser = async () => {
    try {
      setLoading('test')
      await signInAsTestUser()
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message ?? 'Could not sign in as test user')
    } finally { setLoading(null) }
  }

  const handleEmailAuth = async () => handleTestUser()

  const handleGoogleAuth = async () => {
    try {
      setLoading('google')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'skiptheline://auth/callback' },
      })
      if (error) throw error
    } catch (e: any) {
      Alert.alert('Google sign in failed', e.message ?? 'Could not sign in with Google')
    } finally { setLoading(null) }
  }

  const handleAppleAuth = async () => {
    try {
      setLoading('apple')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: 'skiptheline://auth/callback' },
      })
      if (error) throw error
    } catch (e: any) {
      Alert.alert('Apple sign in failed', e.message ?? 'Could not sign in with Apple')
    } finally { setLoading(null) }
  }

  const eyebrowText = SLIDES[slideIndex].label.toUpperCase()

  return (
    <View style={s.container}>

      {/* ── Background slideshow ── */}
      {SLIDES.map((slide, i) => (
        <Animated.View
          key={i}
          style={[StyleSheet.absoluteFillObject, { opacity: fadeAnims[i] }]}
        >
          <Animated.Image
            source={{ uri: slide.image }}
            style={[s.bgImage, { transform: [{ scale: scaleAnims[i] }] }]}
            resizeMode="cover"
          />
        </Animated.View>
      ))}

      {/* ── Gradient overlay ── */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.55)',
          'rgba(0,0,0,0.40)',
          'rgba(0,0,0,0.85)',
        ]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Content ── */}
      <View style={[s.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>

        {/* Brand mark */}
        <Animated.View style={[s.brand, { opacity: brandAnim, transform: [{ translateY: brandTY }] }]}>
          <View style={s.logoTile}>
            <MapPin size={16} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={s.wordmark}>SkipTheLine</Text>
        </Animated.View>

        {/* Spacer pushes everything below to bottom */}
        <View style={{ flex: 1 }} />

        {/* Eyebrow */}
        <Animated.View style={[s.eyebrowRow, { opacity: eyebrowAnim, transform: [{ translateY: eyebrowTY }] }]}>
          <View style={s.eyebrowDot} />
          <Text style={s.eyebrowText}>{eyebrowText}</Text>
        </Animated.View>

        {/* H1 */}
        <Animated.View style={{ opacity: h1Anim, transform: [{ translateY: h1TY }] }}>
          <Text style={s.h1}>
            {'Know the wait\n'}
            <Text style={s.h1Accent}>before you go.</Text>
          </Text>
        </Animated.View>

        {/* Subhead */}
        <Animated.Text style={[s.subhead, { opacity: subAnim, transform: [{ translateY: subTY }] }]}>
          Live, crowd-powered wait times for restaurants, clubs, barbers, landmarks — anywhere you'd rather not stand in line.
        </Animated.Text>

        {/* Auth buttons */}
        <Animated.View style={[s.buttons, { opacity: btnsAnim, transform: [{ translateY: btnsTY }] }]}>

          {/* Email — primary */}
          <Pressable
            testID="btn-continue-email"
            style={({ pressed }) => [s.btnPrimary, pressed && s.pressed]}
            onPress={handleEmailAuth}
            disabled={loading !== null}
          >
            <Text style={s.btnPrimaryText}>
              {loading === 'email' ? 'Signing in...' : 'Continue with email'}
            </Text>
          </Pressable>

          {/* Google — full width */}
          <Pressable
            testID="btn-continue-google"
            style={({ pressed }) => [s.btnGlass, pressed && s.pressed]}
            onPress={handleGoogleAuth}
            disabled={loading !== null}
          >
            <Text style={s.googleG}>G</Text>
            <Text style={s.btnGlassText}>{loading === 'google' ? 'Signing in...' : 'Continue with Google'}</Text>
          </Pressable>

          {/* Apple — full width */}
          <Pressable
            testID="btn-continue-apple"
            style={({ pressed }) => [s.btnGlass, pressed && s.pressed]}
            onPress={handleAppleAuth}
            disabled={loading !== null}
          >
            <Text style={s.appleIcon}></Text>
            <Text style={s.btnGlassText}>{loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}</Text>
          </Pressable>

          {/* Test User — full width */}
          <Pressable
            testID="btn-test-user"
            style={({ pressed }) => [s.btnGlass, s.btnTestUser, pressed && s.pressed]}
            onPress={handleTestUser}
            disabled={loading !== null}
          >
            <Text style={s.btnTestText}>
              {loading === 'test' ? '⚙ Signing in...' : 'Test User'}
            </Text>
          </Pressable>

        </Animated.View>

        {/* Legal */}
        <Text style={s.legal}>By continuing you agree to the Terms &amp; Privacy.</Text>

        {/* Slide indicators */}
        <View style={s.indicators}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => jumpToSlide(i)} hitSlop={8}>
              <View style={[s.dot, i === slideIndex ? s.dotActive : s.dotInactive]} />
            </Pressable>
          ))}
        </View>

      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    width,
    height,
    position: 'absolute',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  wordmark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
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
    backgroundColor: PRIMARY_GLOW,
    shadowColor: PRIMARY_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 11 * 0.18,
    fontFamily: fontFamily.accent,
  },

  // Headline
  h1: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44 * 0.95,
    letterSpacing: -1,
    fontFamily: fontFamily.displayBold,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 24,
  },
  h1Accent: {
    color: PRIMARY_GLOW,
  },

  // Subhead
  subhead: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    maxWidth: 320,
    fontFamily: fontFamily.body,
  },

  // Buttons
  buttons: {
    gap: 10,
    marginTop: 4,
  },
  pressed: {
    transform: [{ scale: 0.985 }, { translateY: 1 }],
  },

  // Primary email button
  btnPrimary: {
    height: 52,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  btnPrimaryText: {
    color: '#FFFCF7',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: fontFamily.display,
  },

  // Glass base — dark visible container matching target
  btnGlass: {
    height: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(30,30,30,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnGlassText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: -0.2,
  },

  // Google G
  googleG: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // Apple icon
  appleIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // Test user — slightly more transparent
  btnTestUser: {
    backgroundColor: 'rgba(30,30,30,0.55)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  btnTestText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.70)',
    fontFamily: fontFamily.body,
    letterSpacing: 0.1,
  },

  // Legal
  legal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontFamily: fontFamily.body,
  },

  // Slide indicators
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 18,
    backgroundColor: PRIMARY_GLOW,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
})
