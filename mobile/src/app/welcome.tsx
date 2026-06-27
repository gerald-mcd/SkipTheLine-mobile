import React, { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  Animated, Alert, TextInput, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin } from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { signInAsTestUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const { width, height } = Dimensions.get('window')
const PRIMARY      = '#F8682B'
const PRIMARY_GLOW = '#FFB37A'

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

export default function WelcomeScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const [slideIndex, setSlideIndex] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showOther, setShowOther] = useState(false)

  const fadeAnims  = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current
  const scaleAnims = useRef(SLIDES.map(() => new Animated.Value(1.0))).current
  const contentAnim = useRef(new Animated.Value(0)).current
  const contentTY   = useRef(new Animated.Value(16)).current

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentTY,   { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  // Slideshow
  useEffect(() => {
    Animated.timing(scaleAnims[0], { toValue: 1.06, duration: 6000, useNativeDriver: true }).start()
    const interval = setInterval(() => {
      setSlideIndex(prev => {
        const next = (prev + 1) % SLIDES.length
        Animated.timing(fadeAnims[prev], { toValue: 0, duration: 1600, useNativeDriver: true }).start()
        Animated.timing(fadeAnims[next], { toValue: 1, duration: 1600, useNativeDriver: true }).start()
        scaleAnims[prev].setValue(1.0)
        scaleAnims[next].setValue(1.0)
        Animated.timing(scaleAnims[next], { toValue: 1.06, duration: 6000, useNativeDriver: true }).start()
        return next
      })
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  // Auth handlers
  const handleEmailContinue = () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Please enter your email to continue.')
      return
    }
    router.push({ pathname: '/auth/email', params: { prefillEmail: email.trim() } } as any)
  }

  const handleApple = async () => {
    try {
      setLoading('apple')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: 'skiptheline://auth/callback' },
      })
      if (error) throw error
    } catch (e: any) {
      Alert.alert('Apple sign in failed', e.message)
    } finally { setLoading(null) }
  }

  const handleGoogle = async () => {
    try {
      setLoading('google')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'skiptheline://auth/callback' },
      })
      if (error) throw error
    } catch (e: any) {
      Alert.alert('Google sign in failed', e.message)
    } finally { setLoading(null) }
  }

  const handleTestUser = async () => {
    try {
      setLoading('test')
      await signInAsTestUser()
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message)
    } finally { setLoading(null) }
  }

  return (
    <View style={s.root}>

      {/* Slideshow */}
      {SLIDES.map((slide, i) => (
        <Animated.View key={i} style={[StyleSheet.absoluteFillObject, { opacity: fadeAnims[i] }]}>
          <Animated.Image
            source={{ uri: slide.image }}
            style={[s.bgImage, { transform: [{ scale: scaleAnims[i] }] }]}
            resizeMode="cover"
          />
        </Animated.View>
      ))}

      {/* Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brand — top */}
      <View style={[s.brandRow, { top: insets.top + 20 }]}>
        <View style={s.logoTile}>
          <MapPin size={16} color="#fff" fill="#fff" />
        </View>
        <Text style={s.wordmark}>SkipTheLine</Text>
      </View>

      {/* Bottom content */}
      <Animated.View
        style={[
          s.bottom,
          { paddingBottom: insets.bottom + 20 },
          { opacity: contentAnim, transform: [{ translateY: contentTY }] },
        ]}
      >
        {/* Eyebrow */}
        <View style={s.eyebrowRow}>
          <View style={s.eyebrowDot} />
          <Text style={s.eyebrowText}>{SLIDES[slideIndex].label.toUpperCase()}</Text>
        </View>

        {/* Headline */}
        <Text style={s.h1}>
          {'Know the wait\n'}
          <Text style={s.h1Accent}>before you go.</Text>
        </Text>

        {/* Subhead */}
        <Text style={s.sub}>
          Live, crowd-powered wait times for restaurants, clubs, barbers, landmarks — anywhere you'd rather not stand in line.
        </Text>

        {/* ── Auth section ── */}
        <View style={s.auth}>

          {/* Email input */}
          <TextInput
            style={s.emailInput}
            placeholder="Email / Phone number"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleEmailContinue}
          />

          {/* Continue */}
          <Pressable
            style={({ pressed }) => [s.btnOrange, pressed && s.pressed]}
            onPress={handleEmailContinue}
            disabled={loading !== null}
          >
            <Text style={s.btnOrangeText}>Continue</Text>
          </Pressable>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>or login with</Text>
            <View style={s.divLine} />
          </View>

          {/* Apple */}
          <Pressable
            style={({ pressed }) => [s.btnDark, pressed && s.pressed]}
            onPress={handleApple}
            disabled={loading !== null}
          >
            <Text style={s.appleIcon}></Text>
            <Text style={s.btnDarkText}>
              {loading === 'apple' ? 'Signing in...' : 'Sign in with Apple'}
            </Text>
          </Pressable>

          {/* Other sign up options */}
          <Pressable
            style={({ pressed }) => [s.btnOutline, pressed && s.pressed]}
            onPress={() => setShowOther(o => !o)}
          >
            <Text style={s.btnOutlineText}>
              {showOther ? 'Hide options' : 'Other sign up options'}
            </Text>
          </Pressable>

          {/* Expanded options */}
          {showOther && (
            <View style={s.otherWrap}>
              <Pressable
                style={({ pressed }) => [s.btnOutline, pressed && s.pressed]}
                onPress={handleGoogle}
                disabled={loading !== null}
              >
                <Text style={s.googleG}>G</Text>
                <Text style={s.btnOutlineText}>
                  {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.btnOutline, s.btnGhost, pressed && s.pressed]}
                onPress={handleTestUser}
                disabled={loading !== null}
              >
                <Text style={s.btnGhostText}>
                  {loading === 'test' ? '⚙ Signing in...' : '⚙ Test User'}
                </Text>
              </Pressable>
            </View>
          )}

        </View>

        {/* Legal */}
        <Text style={s.legal}>By continuing you agree to the Terms &amp; Privacy.</Text>

        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => setSlideIndex(i)} hitSlop={8}>
              <View style={[s.dot, i === slideIndex ? s.dotOn : s.dotOff]} />
            </Pressable>
          ))}
        </View>

      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#000' },
  bgImage: { position: 'absolute', width, height },

  // Brand top-left
  brandRow: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  logoTile: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  wordmark: {
    fontSize: 16, fontWeight: '800', color: '#fff',
    letterSpacing: -0.4, fontFamily: fontFamily.displayBold,
  },

  // Bottom content block
  bottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    gap: 10,
  },

  // Eyebrow
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: PRIMARY_GLOW,
    shadowColor: PRIMARY_GLOW, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 6,
  },
  eyebrowText: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 1.8, fontFamily: fontFamily.accent,
  },

  // Headline
  h1: {
    fontSize: 40, fontWeight: '800', color: '#fff',
    lineHeight: 38, letterSpacing: -1,
    fontFamily: fontFamily.displayBold,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  h1Accent: { color: PRIMARY_GLOW },

  // Subhead
  sub: {
    fontSize: 13, color: 'rgba(255,255,255,0.80)',
    lineHeight: 19, fontFamily: fontFamily.body,
  },

  // Auth container
  auth: { gap: 10, marginTop: 4 },

  // Email input
  emailInput: {
    height: 52, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    fontSize: 15, color: '#fff',
    fontFamily: fontFamily.body,
  },

  // Orange primary
  btnOrange: {
    height: 52, borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38, shadowRadius: 14, elevation: 8,
  },
  btnOrangeText: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    fontFamily: fontFamily.display,
  },

  // Divider
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  divText: { fontSize: 12, color: 'rgba(255,255,255,0.50)', fontFamily: fontFamily.body },

  // Apple dark
  btnDark: {
    height: 52, borderRadius: 999,
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  appleIcon: { fontSize: 18, color: '#fff', lineHeight: 22 },
  btnDarkText: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: fontFamily.bodySemiBold },

  // Outline / ghost
  btnOutline: {
    height: 52, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.80)', fontFamily: fontFamily.body },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' },
  btnGhostText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: fontFamily.body },
  googleG: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Other options expanded
  otherWrap: { gap: 10 },

  // Press feedback
  pressed: { opacity: 0.78 },

  // Legal
  legal: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontFamily: fontFamily.body },

  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 2 },
  dot:  { height: 4, borderRadius: 2 },
  dotOn:  { width: 18, backgroundColor: PRIMARY_GLOW },
  dotOff: { width: 6,  backgroundColor: 'rgba(255,255,255,0.30)' },
})
