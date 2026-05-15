import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, font } from '../constants/theme'

const { width, height } = Dimensions.get('window')

export default function Welcome() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <View style={styles.overlay} />

      {/* Hero content */}
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>⚡</Text>
          <Text style={styles.logoText}>SkipTheLine</Text>
        </View>

        {/* Hero headline */}
        <Text style={styles.headline}>
          See the wait.{'\n'}Skip the line.
        </Text>
        <Text style={styles.subheadline}>
          Real-time, crowd-powered wait times for restaurants, bars, barbershops and more across Miami.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>2.4K</Text>
            <Text style={styles.statLabel}>Active reporters</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>180+</Text>
            <Text style={styles.statLabel}>Venues live</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>4 min</Text>
            <Text style={styles.statLabel}>Avg update</Text>
          </View>
        </View>

        {/* CTA buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>See live wait times →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Continue with Email</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.6)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    gap: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 42,
  },
  subheadline: {
    fontSize: font.base,
    color: colors.textMuted,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: font.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: font.md,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
