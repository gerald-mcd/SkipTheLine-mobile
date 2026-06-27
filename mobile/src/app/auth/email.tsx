import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft } from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'
import { supabase } from '@/lib/supabase'

const PRIMARY = '#F8682B'

export default function EmailAuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Required', 'Please enter your name.')
      return
    }

    try {
      setLoading(true)

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
        if (error) throw error
        if (data.user) {
          // Create user profile row
          await supabase.from('users').upsert({
            auth_id:           data.user.id,
            email:             email.trim(),
            name:              name.trim(),
            handle:            `@${name.trim().toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 9000) + 1000}`,
            is_test_user:      false,
            first_login_at:    new Date().toISOString(),
            terms_accepted_at: new Date().toISOString(),
            terms_version:     '1.0',
          }, { onConflict: 'auth_id' })
        }
      }

      // Navigate to app
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert(
        mode === 'signin' ? 'Sign in failed' : 'Sign up failed',
        e.message ?? 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#33384A" strokeWidth={2.5} />
          </Pressable>
          <Text style={s.headerTitle}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.content}>
          <Text style={s.title}>
            {mode === 'signin' ? 'Welcome back' : 'Join SkipTheLine'}
          </Text>
          <Text style={s.subtitle}>
            {mode === 'signin'
              ? 'Sign in to your account to continue.'
              : 'Create an account to start reporting wait times.'}
          </Text>

          {/* Name field — sign up only */}
          {mode === 'signup' && (
            <View style={s.fieldGroup}>
              <Text style={s.label}>Full name</Text>
              <TextInput
                style={s.input}
                placeholder="Alex Rivera"
                placeholderTextColor="#857565"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          {/* Email */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#857565"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor="#857565"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.88 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
            }
          </Pressable>

          {/* Toggle mode */}
          <Pressable style={s.toggleRow} onPress={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
            <Text style={s.toggleText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={s.toggleLink}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#FCFBF9' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0EBE5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#33384A', fontFamily: fontFamily.display },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  title:   { fontSize: 28, fontWeight: '800', color: '#33384A', letterSpacing: -0.5, fontFamily: fontFamily.displayBold, marginBottom: 6 },
  subtitle:{ fontSize: 14, color: '#857565', fontFamily: fontFamily.body, marginBottom: 28 },
  fieldGroup: { marginBottom: 16 },
  label:   { fontSize: 13, fontWeight: '600', color: '#33384A', fontFamily: fontFamily.bodySemiBold, marginBottom: 6 },
  input:   {
    height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#EDE6DD',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 15,
    color: '#33384A', fontFamily: fontFamily.body,
  },
  btnPrimary: {
    height: 52, borderRadius: 999, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: fontFamily.display },
  toggleRow: { alignItems: 'center', marginTop: 20 },
  toggleText: { fontSize: 14, color: '#857565', fontFamily: fontFamily.body },
  toggleLink: { color: PRIMARY, fontWeight: '700', fontFamily: fontFamily.bodySemiBold },
})
