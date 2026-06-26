import React, { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Settings, Bell, Lock, ChevronRight, Flame, Trophy, TrendingUp, TrendingDown,
  Minus, Zap, Target, Gift, Sparkles, UserPlus, Search, X, Check, Clock, Users,
} from 'lucide-react-native'
import {
  profile, tierFor, quests, rewards, communityImpact, peoplePool, incomingRequests,
  type Quest, type Reward, type Person,
} from '@/lib/mock-data'
import { fontFamily } from '@/constants/theme'

const COLORS = {
  background: '#FCFBF9',
  foreground: '#33384A',
  mutedForeground: '#857565',
  card: '#FFFFFF',
  border: '#EDE6DD',
  primary: '#F8682B',
  primaryGlow: '#F2934D',
  primaryForeground: '#FFFCF7',
  success: '#5DB18A',
  destructive: '#D9462E',
  warning: '#D69A3F',
  accent: '#F8EFE5',
  secondary: '#F7F2EC',
}

export default function ProfileScreen() {
  const { current: tier, next: nextTier, progress } = tierFor(profile.points)
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - profile.points) : 0
  const [findOpen, setFindOpen] = useState(false)
  const [extraFriends, setExtraFriends] = useState<typeof profile.friends>([])
  const allFriends = useMemo(() => [...(profile.friends ?? []), ...extraFriends], [extraFriends])

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showAllRewards, setShowAllRewards] = useState(false)
  const [showAllBadges, setShowAllBadges] = useState(false)

  const RankIcon = (profile as any).rankTrend === 'up' ? TrendingUp
    : (profile as any).rankTrend === 'down' ? TrendingDown : Minus
  const rankColor = (profile as any).rankTrend === 'up' ? COLORS.success
    : (profile as any).rankTrend === 'down' ? COLORS.destructive : COLORS.mutedForeground

  return (
    <SafeAreaView edges={['top']} style={styles.safe} testID="profile-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userLocation}>{profile.neighborhood}, {profile.city}</Text>
              <View style={styles.badgeRow}>
                {profile.badges.filter(b => b.earned).slice(0, 6).map(b => (
                  <View key={b.id} style={styles.badgePip}>
                    <Text style={{ fontSize: 10 }}>{b.emoji}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Pressable style={styles.settingsBtn} onPress={() => setSettingsOpen(true)}>
            <Settings size={16} color={COLORS.mutedForeground} />
          </Pressable>
        </View>

        {/* Hero gamification card */}
        <LinearGradient
          colors={['#F8682B', '#F2934D', '#F0A870']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.tierRow}>
              <View style={styles.tierEmoji}>
                <Text style={{ fontSize: 16 }}>{tier.emoji}</Text>
              </View>
              <View>
                <Text style={styles.tierLabel}>Tier · {tier.name}</Text>
                <Text style={styles.tierPerk}>{tier.perks[0]}</Text>
              </View>
            </View>
            <View style={styles.weeklyXP}>
              <Zap size={10} color="#fff" />
              <Text style={styles.weeklyXPText}>+{communityImpact.weeklyXP} this week</Text>
            </View>
          </View>

          <View style={styles.pointsRow}>
            <Text style={styles.pointsNumber}>{profile.points.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}>SkipPoints</Text>
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
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox icon={<Flame size={14} color={COLORS.warning} />} value={`${profile.streak}d`} label="Streak" />
          <StatBox icon={<Trophy size={14} color={COLORS.primary} />} value={`#${profile.rank}`} label="Rank" />
          <StatBox
            icon={<RankIcon size={14} color={rankColor} />}
            value={`${(profile as any).rankTrend === 'down' ? '−' : '+'}${(profile as any).rankDelta ?? 0}`}
            label="Trend"
          />
          <StatBox
            icon={<Users size={14} color={COLORS.success} />}
            value={communityImpact.peopleHelped >= 1000 ? `${(communityImpact.peopleHelped / 1000).toFixed(1)}k` : `${communityImpact.peopleHelped}`}
            label="Helped"
          />
        </View>

        {/* Active Quests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Target size={14} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Active quests</Text>
            </View>
            <Text style={styles.sectionMeta}>Resets in 6h</Text>
          </View>
          {quests.map(q => <QuestCard key={q.id} quest={q} />)}
        </View>

        {/* Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Gift size={14} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Redeem rewards</Text>
            </View>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setShowAllRewards(prev => !prev)}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>{showAllRewards ? 'Show less' : 'Shop all'}</Text>
              <ChevronRight size={12} color={COLORS.primary} />
            </Pressable>
          </View>
          {showAllRewards ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {rewards.map(r => <RewardCard key={r.id} reward={r} userPoints={profile.points} />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
              {rewards.map(r => <RewardCard key={r.id} reward={r} userPoints={profile.points} />)}
            </ScrollView>
          )}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Badges</Text>
            </View>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setShowAllBadges(prev => !prev)}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>{showAllBadges ? 'Show less' : 'View all'}</Text>
              <ChevronRight size={12} color={COLORS.primary} />
            </Pressable>
          </View>
          <View style={styles.badgeGrid}>
            {(showAllBadges ? profile.badges : profile.badges.slice(0, 6)).map(b => (
              <View key={b.id} style={[styles.badgeGridItem, { opacity: b.earned ? 1 : 0.45 }]}>
                <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
                {!b.earned && <Text style={styles.badgeLocked}>Locked</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Friends */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Friends{' '}
              <Text style={styles.sectionMeta}>{allFriends.length}</Text>
            </Text>
            <Pressable style={styles.findFriendsBtn} onPress={() => setFindOpen(true)}>
              <UserPlus size={13} color="#fff" />
              <Text style={styles.findFriendsBtnText}>Find friends</Text>
            </Pressable>
          </View>
          <Text style={styles.friendsNote}>Friends' names appear on their reports. Strangers stay anonymous.</Text>
          <View style={styles.friendsList}>
            {allFriends.map((f, i) => (
              <View key={f.id} style={[styles.friendRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{f.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.friendName}>{f.name}</Text>
                  <Text style={styles.friendHandle}>{f.handle}</Text>
                </View>
                <Text style={styles.friendTag}>Friends</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {findOpen ? (
        <FindFriendsModal
          existingIds={new Set(allFriends.map(f => f.id))}
          onClose={() => setFindOpen(false)}
          onAdd={(p) => setExtraFriends(prev => prev.some(x => x.id === p.id) ? prev : [...prev, { id: p.id, name: p.name, handle: p.handle, initial: p.initial }])}
        />
      ) : null}
      {settingsOpen ? (
        <Modal visible animationType="slide" transparent>
          <Pressable style={settingsModalStyles.backdrop} onPress={() => setSettingsOpen(false)} />
          <View style={settingsModalStyles.sheet}>
            <View style={settingsModalStyles.handleBar} />
            <View style={settingsModalStyles.header}>
              <Text style={settingsModalStyles.title}>Settings</Text>
              <Pressable style={settingsModalStyles.closeBtn} onPress={() => setSettingsOpen(false)}>
                <X size={16} color={COLORS.foreground} />
              </Pressable>
            </View>
            <View style={settingsModalStyles.list}>
              <SettingsRow label="Notifications" value="On" />
              <SettingsRow label="Location" value="Miami, FL" />
              <SettingsRow label="Privacy" value="Friends only" />
              <SettingsRow label="Units" value="Minutes" />
              <SettingsRow label="App version" value="1.0.0" />
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  )
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <Text style={{ fontSize: 14, color: COLORS.foreground, fontFamily: fontFamily.body }}>{label}</Text>
      <Text style={{ fontSize: 14, color: COLORS.mutedForeground, fontFamily: fontFamily.body }}>{value}</Text>
    </View>
  )
}

const settingsModalStyles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.foreground, letterSpacing: -0.3, fontFamily: fontFamily.display },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16 },
})

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={statStyles.box}>
      <View style={statStyles.top}>{icon}<Text style={statStyles.value}>{value}</Text></View>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}
const statStyles = StyleSheet.create({
  box: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  value: { fontSize: 16, fontWeight: '600', color: COLORS.foreground, fontFamily: fontFamily.display },
  label: { fontSize: 9, fontWeight: '700', color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3, fontFamily: fontFamily.accent },
})

function QuestCard({ quest }: { quest: Quest }) {
  const pct = Math.min(100, (quest.progress / quest.goal) * 100)
  const done = quest.progress >= quest.goal
  return (
    <View style={questStyles.card}>
      <View style={questStyles.emoji}><Text style={{ fontSize: 18 }}>{quest.emoji}</Text></View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={questStyles.title} numberOfLines={1}>{quest.title}</Text>
          <View style={[questStyles.reward, { backgroundColor: done ? COLORS.success : COLORS.accent }]}>
            <Zap size={9} color={done ? '#fff' : COLORS.primary} />
            <Text style={[questStyles.rewardText, { color: done ? '#fff' : COLORS.primary }]}>{quest.reward}</Text>
          </View>
        </View>
        <Text style={questStyles.desc}>{quest.description}</Text>
        <View style={questStyles.progressRow}>
          <View style={questStyles.track}>
            <View style={[questStyles.fill, { width: `${pct}%` as any, backgroundColor: done ? COLORS.success : COLORS.primary }]} />
          </View>
          <Text style={questStyles.count}>{quest.progress}/{quest.goal}</Text>
        </View>
      </View>
    </View>
  )
}
const questStyles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8 },
  emoji: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.foreground, flex: 1, fontFamily: fontFamily.display },
  desc: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 2, fontFamily: fontFamily.body },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 9999, paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0 },
  rewardText: { fontSize: 10, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  count: { fontSize: 10, fontWeight: '700', color: COLORS.mutedForeground },
})

function RewardCard({ reward, userPoints }: { reward: Reward; userPoints: number }) {
  const locked = !reward.unlocked || userPoints < reward.cost
  return (
    <View style={[rewardStyles.card, { opacity: locked ? 0.85 : 1 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24 }}>{reward.emoji}</Text>
        {locked
          ? <Lock size={13} color={COLORS.mutedForeground} />
          : <View style={rewardStyles.ready}><Text style={rewardStyles.readyText}>Ready</Text></View>
        }
      </View>
      <Text style={rewardStyles.brand}>{reward.brand}</Text>
      <Text style={rewardStyles.title}>{reward.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 10 }}>
        <Zap size={11} color={locked ? COLORS.mutedForeground : COLORS.primary} />
        <Text style={[rewardStyles.cost, { color: locked ? COLORS.mutedForeground : COLORS.primary }]}>
          {reward.cost.toLocaleString()}
        </Text>
      </View>
    </View>
  )
}
const rewardStyles = StyleSheet.create({
  card: { width: 144, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  brand: { fontSize: 9, fontWeight: '700', color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.foreground, marginTop: 2, lineHeight: 18 },
  cost: { fontSize: 11, fontWeight: '700' },
  ready: { backgroundColor: COLORS.success, borderRadius: 9999, paddingHorizontal: 6, paddingVertical: 2 },
  readyText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
})

function FindFriendsModal({ existingIds, onClose, onAdd }: {
  existingIds: Set<string>
  onClose: () => void
  onAdd: (p: Person) => void
}) {
  const [q, setQ] = useState('')
  const [requested, setRequested] = useState<Set<string>>(new Set())
  const [accepted, setAccepted] = useState<Set<string>>(new Set())

  const results = useMemo(() => {
    const candidates = peoplePool.filter(p => !existingIds.has(p.id))
    const term = q.trim().toLowerCase()
    if (!term) return candidates
    return candidates.filter(p =>
      p.name.toLowerCase().includes(term) || p.handle.toLowerCase().includes(term)
    )
  }, [q, existingIds])

  return (
    <Modal visible animationType="slide" transparent>
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.handleBar} />
        <View style={modalStyles.header}>
          <View>
            <Text style={modalStyles.pretitle}>Connect</Text>
            <Text style={modalStyles.title}>Find friends</Text>
          </View>
          <Pressable style={modalStyles.closeBtn} onPress={onClose}>
            <X size={16} color={COLORS.foreground} />
          </Pressable>
        </View>
        <View style={modalStyles.searchRow}>
          <Search size={15} color={COLORS.mutedForeground} />
          <TextInput
            style={modalStyles.input}
            placeholder="Search by name or handle..."
            placeholderTextColor={COLORS.mutedForeground}
            value={q}
            onChangeText={setQ}
            autoFocus
          />
          {q !== '' && (
            <Pressable onPress={() => setQ('')}>
              <X size={14} color={COLORS.mutedForeground} />
            </Pressable>
          )}
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}>
          {results.map(p => {
            const isReq = requested.has(p.id)
            const isAcc = accepted.has(p.id)
            return (
              <View key={p.id} style={modalStyles.personRow}>
                <View style={modalStyles.personAvatar}>
                  <Text style={modalStyles.personAvatarText}>{p.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.personName}>{p.name} <Text style={modalStyles.personHandle}>{p.handle}</Text></Text>
                  <Text style={modalStyles.personMeta}>{p.city} · {p.mutuals} mutual · {p.reportsCount} reports</Text>
                </View>
                {isAcc ? (
                  <View style={modalStyles.friendsBadge}>
                    <Check size={10} color={COLORS.primary} />
                    <Text style={modalStyles.friendsBadgeText}>Friends</Text>
                  </View>
                ) : isReq ? (
                  <View style={modalStyles.requestedBadge}>
                    <Clock size={10} color={COLORS.mutedForeground} />
                    <Text style={modalStyles.requestedText}>Sent</Text>
                  </View>
                ) : (
                  <Pressable style={modalStyles.addBtn} onPress={() => {
                    setRequested(prev => new Set(prev).add(p.id))
                    setTimeout(() => {
                      setAccepted(prev => new Set(prev).add(p.id))
                      onAdd(p)
                    }, 1200)
                  }}>
                      <UserPlus size={12} color="#fff" />
                      <Text style={modalStyles.addBtnText}>Add</Text>
                  </Pressable>
                )}
              </View>
            )
          })}
        </ScrollView>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 40 },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  pretitle: { fontSize: 9, fontWeight: '700', color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.foreground, letterSpacing: -0.3 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.card, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, fontSize: 13, color: COLORS.foreground },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  personAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  personAvatarText: { fontSize: 14, fontWeight: '600', color: COLORS.foreground },
  personName: { fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  personHandle: { fontWeight: '400', color: COLORS.mutedForeground },
  personMeta: { fontSize: 10, color: COLORS.mutedForeground, marginTop: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F8682B' },
  addBtnText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  friendsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.accent, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  friendsBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.3 },
  requestedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.secondary, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  requestedText: { fontSize: 10, fontWeight: '600', color: COLORS.mutedForeground },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.foreground, fontFamily: fontFamily.display },
  userLocation: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 1, fontFamily: fontFamily.body },
  badgeRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  badgePip: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  settingsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },

  heroCard: { borderRadius: 24, padding: 20, marginBottom: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierEmoji: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  tierLabel: { fontSize: 10, fontWeight: '700', color: '#fff', opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: fontFamily.accent },
  tierPerk: { fontSize: 10, color: '#fff', opacity: 0.8, marginTop: 1 },
  weeklyXP: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  weeklyXPText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 },
  pointsNumber: { fontSize: 48, fontWeight: '700', color: '#fff', letterSpacing: -1, fontFamily: fontFamily.displayBold },
  pointsLabel: { fontSize: 14, fontWeight: '600', color: '#fff', opacity: 0.9, fontFamily: fontFamily.body },
  progressSection: { marginTop: 16 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: '#fff', opacity: 0.9, fontFamily: fontFamily.bodySemiBold },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },

  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.foreground, letterSpacing: -0.2, fontFamily: fontFamily.display },
  sectionMeta: { fontSize: 11, fontWeight: '600', color: COLORS.mutedForeground },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeGridItem: { width: '30%', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, alignItems: 'center' },
  badgeName: { fontSize: 11, fontWeight: '600', color: COLORS.foreground, marginTop: 4, textAlign: 'center' },
  badgeLocked: { fontSize: 9, color: COLORS.mutedForeground, marginTop: 2 },

  friendsList: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  friendAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  friendAvatarText: { fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  friendName: { fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  friendHandle: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 1 },
  friendTag: { fontSize: 11, fontWeight: '600', color: COLORS.mutedForeground },
  friendsNote: { fontSize: 11, color: COLORS.mutedForeground, marginBottom: 10 },
  findFriendsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F8682B' },
  findFriendsBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
})
