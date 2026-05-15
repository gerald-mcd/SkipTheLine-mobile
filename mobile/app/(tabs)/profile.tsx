import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
import { colors, spacing, radius, font } from '../../constants/theme'
import { profile } from '../../lib/mock-data'

const tiers = [
  { name: 'Scout', emoji: '🔍', min: 0, max: 999, perks: ['Basic access'] },
  { name: 'Insider', emoji: '⚡', min: 1000, max: 2999, perks: ['Early event alerts'] },
  { name: 'Local Hero', emoji: '🏆', min: 3000, max: 7499, perks: ['Priority reporting', 'Business perks'] },
  { name: 'City Legend', emoji: '👑', min: 7500, max: 99999, perks: ['VIP badge', 'Exclusive rewards'] },
]

function tierFor(pts: number) {
  const current = tiers.findLast(t => pts >= t.min) ?? tiers[0]
  const idx = tiers.indexOf(current)
  const next = tiers[idx + 1]
  const progress = next ? Math.round(((pts - current.min) / (next.min - current.min)) * 100) : 100
  return { current, next, progress }
}

const quests = [
  { id: 'q1', emoji: '📍', title: 'Report 3 venues today', description: 'Help your city stay accurate', progress: 2, goal: 3, reward: 75 },
  { id: 'q2', emoji: '🔥', title: 'Hit a 14-day streak', description: 'Report every day this week', progress: 12, goal: 14, reward: 150 },
  { id: 'q3', emoji: '🌙', title: 'Night Owl — 3 night reports', description: 'Report after 10pm', progress: 1, goal: 3, reward: 50 },
]

const rewards = [
  { id: 'r1', emoji: '🍕', brand: 'Domino\'s', title: 'Free medium pizza', cost: 2500, unlocked: true },
  { id: 'r2', emoji: '☕', brand: 'Starbucks', title: '$5 gift card', cost: 1500, unlocked: true },
  { id: 'r3', emoji: '🎟️', brand: 'Eventbrite', title: '20% off next event', cost: 3000, unlocked: false },
]

const leaderboard = [
  { rank: 1, name: 'Jasmine K.', points: 8420, you: false },
  { rank: 2, name: 'Rico M.', points: 7110, you: false },
  { rank: 3, name: 'Priya S.', points: 6890, you: false },
  { rank: 46, name: 'Theo W.', points: 2895, you: false },
  { rank: 47, name: 'You', points: 2840, you: true },
  { rank: 48, name: 'Nina B.', points: 2770, you: false },
]

export default function ProfileScreen() {
  const { current: tier, next: nextTier, progress } = tierFor(profile.points)
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - profile.points) : 0
  const [activeSection, setActiveSection] = useState<'quests' | 'badges' | 'leaderboard'>('quests')

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{profile.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{profile.name}</Text>
            <Text style={styles.headerLocation}>📍 {profile.neighborhood}, {profile.city}</Text>
            <View style={styles.badgeRow}>
              {profile.badges.filter(b => b.earned).slice(0, 4).map(b => (
                <View key={b.id} style={styles.badgeChip}>
                  <Text style={styles.badgeChipEmoji}>{b.emoji}</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gamification hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeEmoji}>{tier.emoji}</Text>
            <View>
              <Text style={styles.tierBadgeLabel}>TIER · {tier.name.toUpperCase()}</Text>
              <Text style={styles.tierBadgePerk}>{tier.perks[0]}</Text>
            </View>
          </View>
          <View style={styles.xpChip}>
            <Text style={styles.xpChipText}>⚡ +160 this week</Text>
          </View>
        </View>

        <View style={styles.heroPoints}>
          <Text style={styles.heroPointsNum}>{profile.points.toLocaleString()}</Text>
          <Text style={styles.heroPointsLabel}>SkipPoints</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{tier.name}</Text>
            <Text style={styles.progressLabel}>
              {nextTier ? `${pointsToNext.toLocaleString()} to ${nextTier.name} ${nextTier.emoji}` : 'Max tier'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox icon="🔥" value={`${profile.streak}d`} label="Streak" />
        <StatBox icon="🏆" value={`#${profile.rank}`} label="Rank" />
        <StatBox icon="📋" value={`${profile.reportsThisWeek}`} label="Reports" />
        <StatBox icon="👥" value="1.2k" label="Helped" />
      </View>

      {/* Section tabs */}
      <View style={styles.tabRow}>
        {(['quests', 'badges', 'leaderboard'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, activeSection === s && styles.tabActive]}
            onPress={() => setActiveSection(s)}
          >
            <Text style={[styles.tabText, activeSection === s && styles.tabTextActive]}>
              {s === 'quests' ? '🎯 Quests' : s === 'badges' ? '✨ Badges' : '🏅 Rank'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quests */}
      {activeSection === 'quests' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active quests</Text>
            <Text style={styles.sectionMeta}>Resets in 6h</Text>
          </View>
          {quests.map(q => {
            const pct = Math.min(100, (q.progress / q.goal) * 100)
            const done = q.progress >= q.goal
            return (
              <View key={q.id} style={styles.questCard}>
                <View style={styles.questIcon}>
                  <Text style={styles.questIconEmoji}>{q.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.questTitleRow}>
                    <Text style={styles.questTitle} numberOfLines={1}>{q.title}</Text>
                    <View style={[styles.questReward, done && styles.questRewardDone]}>
                      <Text style={[styles.questRewardText, done && { color: colors.white }]}>
                        ⚡ {q.reward}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.questDesc}>{q.description}</Text>
                  <View style={styles.questProgress}>
                    <View style={styles.questProgressTrack}>
                      <View style={[
                        styles.questProgressFill,
                        { width: `${pct}%` as any },
                        done && { backgroundColor: colors.waitShort },
                      ]} />
                    </View>
                    <Text style={styles.questProgressLabel}>{q.progress}/{q.goal}</Text>
                  </View>
                </View>
              </View>
            )
          })}

          {/* Rewards */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>🎁 Redeem rewards</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rewardsRow}>
              {rewards.map(r => {
                const locked = profile.points < r.cost || !r.unlocked
                return (
                  <TouchableOpacity key={r.id} style={[styles.rewardCard, locked && styles.rewardCardLocked]} activeOpacity={0.85}>
                    <View style={styles.rewardTop}>
                      <Text style={styles.rewardEmoji}>{r.emoji}</Text>
                      {locked
                        ? <Text style={styles.lockIcon}>🔒</Text>
                        : <View style={styles.readyBadge}><Text style={styles.readyBadgeText}>Ready</Text></View>
                      }
                    </View>
                    <Text style={styles.rewardBrand}>{r.brand}</Text>
                    <Text style={styles.rewardTitle}>{r.title}</Text>
                    <View style={styles.rewardCost}>
                      <Text style={[styles.rewardCostText, !locked && { color: colors.primary }]}>
                        ⚡ {r.cost.toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Badges */}
      {activeSection === 'badges' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your badges</Text>
          <View style={styles.badgesGrid}>
            {profile.badges.map(b => (
              <View key={b.id} style={[styles.badgeItem, !b.earned && styles.badgeItemLocked]}>
                <Text style={styles.badgeItemEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeItemName}>{b.name}</Text>
                {!b.earned && <Text style={styles.badgeItemLockText}>Locked</Text>}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Leaderboard */}
      {activeSection === 'leaderboard' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miami · Wynwood</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.map((entry, i) => {
              const isYou = entry.you
              const showDots = i > 0 && leaderboard[i - 1].rank < entry.rank - 1
              return (
                <View key={entry.rank}>
                  {showDots && (
                    <Text style={styles.leaderboardDots}>· · ·</Text>
                  )}
                  <View style={[
                    styles.leaderboardRow,
                    isYou && styles.leaderboardRowYou,
                    i > 0 && !showDots && styles.leaderboardRowBorder,
                  ]}>
                    <Text style={[styles.leaderboardRank, isYou && { color: colors.primary }]}>
                      #{entry.rank}
                    </Text>
                    <Text style={[styles.leaderboardName, isYou && { color: colors.primary, fontWeight: '700' }]}>
                      {entry.name}
                    </Text>
                    <Text style={[styles.leaderboardPoints, isYou && { color: colors.primary }]}>
                      {entry.points.toLocaleString()} pts
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <View style={styles.statBoxTop}>
        <Text style={styles.statBoxIcon}>{icon}</Text>
        <Text style={styles.statBoxValue}>{value}</Text>
      </View>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108,71,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  headerInfo: { flex: 1 },
  headerName: { fontSize: font.base, fontWeight: '700', color: colors.text },
  headerLocation: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  badgeChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(108,71,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeChipEmoji: { fontSize: 11 },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: { fontSize: 16 },
  heroCard: {
    margin: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.md,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierBadgeEmoji: {
    fontSize: 16,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tierBadgeLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5 },
  tierBadgePerk: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  xpChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  xpChipText: { fontSize: 10, fontWeight: '700', color: colors.white },
  heroPoints: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 },
  heroPointsNum: { fontSize: 48, fontWeight: '800', color: colors.white, letterSpacing: -2 },
  heroPointsLabel: { fontSize: font.sm, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  progressSection: { marginTop: spacing.md },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBoxTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statBoxIcon: { fontSize: 14 },
  statBoxValue: { fontSize: font.md, fontWeight: '700', color: colors.text },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  section: { paddingHorizontal: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.text },
  sectionMeta: { fontSize: 11, color: colors.textMuted },
  questCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(108,71,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconEmoji: { fontSize: 18 },
  questTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  questTitle: { flex: 1, fontSize: font.sm, fontWeight: '600', color: colors.text },
  questReward: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(108,71,255,0.15)',
  },
  questRewardDone: { backgroundColor: colors.waitShort },
  questRewardText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  questDesc: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  questProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  questProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  questProgressLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  rewardsRow: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md },
  rewardCard: {
    width: 148,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rewardCardLocked: { opacity: 0.8 },
  rewardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardEmoji: { fontSize: 24 },
  lockIcon: { fontSize: 14 },
  readyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.waitShort,
  },
  readyBadgeText: { fontSize: 9, fontWeight: '700', color: colors.white, textTransform: 'uppercase' },
  rewardBrand: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  rewardTitle: { fontSize: font.sm, fontWeight: '600', color: colors.text, marginTop: 2, lineHeight: 16 },
  rewardCost: { flexDirection: 'row', marginTop: 10 },
  rewardCostText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeItem: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeItemLocked: { opacity: 0.45 },
  badgeItemEmoji: { fontSize: 24 },
  badgeItemName: { fontSize: 11, fontWeight: '600', color: colors.text, marginTop: 4, textAlign: 'center' },
  badgeItemLockText: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  leaderboardCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  leaderboardRowYou: { backgroundColor: 'rgba(108,71,255,0.1)' },
  leaderboardRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  leaderboardRank: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted, width: 40 },
  leaderboardName: { flex: 1, fontSize: font.sm, color: colors.text },
  leaderboardPoints: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted },
  leaderboardDots: { textAlign: 'center', color: colors.textMuted, fontSize: 12, paddingVertical: 4 },
})
