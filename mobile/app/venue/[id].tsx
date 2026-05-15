import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { colors, spacing, radius, font } from '../../constants/theme'
import { venues, getWaitColor, getWaitLabel } from '../../lib/mock-data'

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const v = venues.find(x => x.id === id)

  if (!v) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Venue not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const trendEmoji = v.trend === 'up' ? '📈' : v.trend === 'down' ? '📉' : '➡️'
  const trendLabel = v.trend === 'up' ? 'Rising' : v.trend === 'down' ? 'Dropping' : 'Steady'

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.hero}>
          <Image source={{ uri: v.image }} style={styles.heroImg} contentFit="cover" />
          <View style={styles.heroOverlay} />

          {/* Back / action buttons */}
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>♡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wait badge on hero */}
          <View style={[styles.heroBadge, { backgroundColor: getWaitColor(v.severity) }]}>
            <Text style={styles.heroBadgeNum}>{v.waitMinutes}</Text>
            <Text style={styles.heroBadgeUnit}>min</Text>
          </View>

          {/* Venue name / category */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroCategoryLabel}>{v.categoryLabel} · {v.distance}</Text>
            <Text style={styles.heroName}>{v.name}</Text>
            <Text style={styles.heroVibe}>{v.vibe}</Text>
          </View>
        </View>

        {/* Event banner */}
        {v.event && (
          <View style={styles.eventBanner}>
            <Text style={styles.eventBannerText}>🎵 {v.event}</Text>
          </View>
        )}

        {/* Wait time stats */}
        <View style={styles.statsRow}>
          <StatCard label="Wait now" value={getWaitLabel(v.waitMinutes)} color={getWaitColor(v.severity)} />
          <StatCard label="Typical" value={`~${v.typicalWaitMinutes}m`} color={colors.textMuted} />
          <StatCard label="Trend" value={`${trendEmoji} ${trendLabel}`} color={colors.textMuted} />
        </View>

        {/* Live reporters */}
        <View style={styles.reportersCard}>
          <View style={styles.reportersRow}>
            <Text style={styles.reportersTitle}>👥 {v.liveReporters} reporting live</Text>
            <Text style={styles.reportersTime}>{v.lastReportMinutes}m ago</Text>
          </View>
          <View style={styles.reporterAvatars}>
            {v.reporterNames.map((name, i) => (
              <View key={i} style={[styles.reporterAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                <Text style={styles.reporterAvatarText}>{name.charAt(0)}</Text>
              </View>
            ))}
            <Text style={styles.reporterNames}>
              {v.reporterNames.join(', ')} {v.reportsCount > v.reporterNames.length ? `+ ${v.reportsCount - v.reporterNames.length} more` : ''}
            </Text>
          </View>

          {/* Recent quote */}
          {v.recentQuote && (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{v.recentQuote.text}"</Text>
              <Text style={styles.quoteMeta}>— {v.recentQuote.author} · {v.recentQuote.ago} ago</Text>
            </View>
          )}
        </View>

        {/* Venue info */}
        <View style={styles.infoCard}>
          <InfoRow icon="🕐" label="Hours" value={v.hours} />
          <InfoRow icon="📍" label="Address" value={v.address} />
          <InfoRow icon="🏷️" label="Category" value={v.categoryLabel} border />
        </View>

        {/* Report CTA */}
        <TouchableOpacity style={styles.reportBtn} activeOpacity={0.85}>
          <Text style={styles.reportBtnText}>📢 Report Current Wait Time</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  )
}

function InfoRow({ icon, label, value, border }: { icon: string; label: string; value: string; border?: boolean }) {
  return (
    <View style={[styles.infoRow, border && styles.infoRowBorder]}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  notFoundText: { color: colors.text, fontSize: font.base, marginBottom: spacing.sm },
  backLink: { color: colors.primary, fontSize: font.sm },
  hero: { height: 340, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroButtons: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: { fontSize: 18, color: '#000' },
  heroBadge: {
    position: 'absolute',
    bottom: 80,
    right: spacing.md,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  heroBadgeNum: { color: colors.white, fontSize: 20, fontWeight: '800', lineHeight: 22 },
  heroBadgeUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroCategoryLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  heroName: { fontSize: 28, fontWeight: '800', color: colors.white, letterSpacing: -0.5, lineHeight: 32 },
  heroVibe: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  eventBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(108,71,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108,71,255,0.3)',
  },
  eventBannerText: { color: colors.primary, fontWeight: '600', fontSize: font.sm },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardValue: { fontSize: font.sm, fontWeight: '700', textAlign: 'center' },
  statCardLabel: { fontSize: 10, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  reportersCard: {
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportersTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  reportersTime: { fontSize: 11, color: colors.textMuted },
  reporterAvatars: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap' },
  reporterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  reporterAvatarText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  reporterNames: { fontSize: 11, color: colors.textMuted, marginLeft: 8, flex: 1 },
  quoteCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  quoteText: { fontSize: 13, color: colors.text, fontStyle: 'italic' },
  quoteMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  infoCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  infoRowIcon: { fontSize: 16, width: 24 },
  infoRowLabel: { flex: 1, fontSize: font.sm, color: colors.textMuted },
  infoRowValue: { fontSize: font.sm, fontWeight: '600', color: colors.text, textAlign: 'right', flex: 2 },
  reportBtn: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  reportBtnText: { color: colors.white, fontWeight: '700', fontSize: font.base },
})
