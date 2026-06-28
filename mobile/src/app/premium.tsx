/**
 * SkipTheLine — Premium Pass / Business Suite screen
 * Spec: /business page from design system doc
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ChevronLeft, Sparkles, Clock, Users, TrendingUp,
  Calendar, Shield, Download, BarChart2,
} from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'
import { useColors } from '@/lib/theme-store'

const { width } = Dimensions.get('window')
const PRIMARY = '#F8682B'
const PRIMARY_GLOW = '#F2934D'

// ─── Suite feature cards ──────────────────────────────────────────────────────

const SUITE_FEATURES = [
  { icon: Clock,      title: 'Wait Intel',        desc: 'Hour-by-hour wait curves, peak windows, weekend vs. weekday deltas.' },
  { icon: Users,      title: 'Foot Traffic',       desc: 'Reporter density, dwell time, walk-by share for your venue.' },
  { icon: TrendingUp, title: 'Competitor Pulse',   desc: 'How your line compares to the 5 closest venues in your category.' },
  { icon: Calendar,   title: 'Event Lift',         desc: 'What concerts, games and weather did to demand last week.' },
  { icon: Shield,     title: 'Reporter Quality',   desc: 'Confidence-weighted reports, dispute rate, anomaly flags.' },
  { icon: Download,   title: 'CSV Exports',        desc: 'Pull every metric into your BI tool. White-glove onboarding.' },
]

// ─── Demo metrics ─────────────────────────────────────────────────────────────

const DEMO_METRICS = [
  { label: 'Avg wait this week',    value: '28m',    delta: '↓ 6m vs last week',      up: true  },
  { label: 'Peak hour',             value: 'Fri 9p', delta: '67 min avg',              up: false },
  { label: 'Category rank',         value: '#2/8',   delta: 'Top 25% efficiency',      up: true  },
  { label: 'Venue views',           value: '1.2k',   delta: '↑ 18% vs last week',      up: true  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  { name: 'Basic',      price: '$29',  period: '/mo', features: ['Wait Intel', 'Venue analytics', 'Weekly email report', '1 venue'],                                                         highlight: false },
  { name: 'Pro',        price: '$99',  period: '/mo', features: ['Everything in Basic', 'Foot Traffic', 'Competitor Pulse', 'Event Lift', '3 venues'],                                       highlight: true  },
  { name: 'Enterprise', price: '$199', period: '/mo', features: ['Everything in Pro', 'Named competitors', 'CSV exports', 'Reporter Quality', 'Unlimited venues', 'White-glove onboarding'], highlight: false },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const router = useRouter()
  const c = useColors()
  const [tab, setTab] = useState<'overview' | 'features' | 'pricing'>('overview')

  const primaryTint9  = 'rgba(248,104,43,0.09)'
  const primaryTint12 = 'rgba(248,104,43,0.12)'
  const primaryTint40 = 'rgba(248,104,43,0.40)'

  return (
    <View style={[s.root, { backgroundColor: c.background }]}>

      {/* Ambient layer 1 — top wash, 460px, primary 9% → background */}
      <LinearGradient
        colors={['rgba(248,104,43,0.09)', c.background]}
        locations={[0, 0.85]}
        style={s.ambientTop}
        pointerEvents="none"
      />

      {/* Ambient layer 2 — glow blob right side */}
      <View style={s.ambientBlob} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

          {/* ── Header px-5 pt-5 ── */}
          <View style={s.header}>
            {/* Back chip — rounded-full, bg-card, border, shadow-sm */}
            <Pressable
              style={({ pressed }) => [s.backChip, { backgroundColor: c.card, borderColor: c.border }, pressed && { opacity: 0.7 }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={14} color={c.foreground} strokeWidth={2.5} />
              <Text style={[s.backText, { color: c.foreground }]}>Back</Text>
            </Pressable>
          </View>

          {/* ── Hero row mt-5 ── */}
          <View style={s.heroRow}>
            {/* Diamond tile — h-14 w-14 (56), rounded-2xl (22), gradient-aurora, shadow-glow */}
            <LinearGradient
              colors={[PRIMARY, PRIMARY_GLOW]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.heroTile}
            >
              <Text style={s.heroGlyph}>◆</Text>
            </LinearGradient>

            {/* Text stack */}
            <View style={{ flex: 1 }}>
              {/* Pill badge */}
              <View style={[s.heroBadge, { backgroundColor: primaryTint12 }]}>
                <Text style={s.heroBadgeText}>PREMIUM PASS · FOR BUSINESS OWNERS</Text>
              </View>

              {/* H1 — text-[26px] extrabold leading-[1.05] tracking-tight font-display */}
              <Text style={[s.heroH1, { color: c.foreground }]}>
                Turn your line{'\n'}into your edge.
              </Text>

              {/* Subhead — mt-3, text-[13px], muted; price semibold foreground */}
              <Text style={[s.heroSub, { color: c.mutedForeground }]}>
                Live wait intel, foot-traffic patterns, competitor pulse and event lift — built from the same crowd signal powering SkipTheLine.{' '}
                <Text style={{ fontWeight: '600', color: c.foreground }}>From $29–$199/mo.</Text>
              </Text>

              {/* CTA row mt-4 */}
              <View style={s.heroCtas}>
                <Pressable style={({ pressed }) => [s.ctaPrimary, pressed && { opacity: 0.88 }]}>
                  <Text style={s.ctaPrimaryText}>Request early access</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [s.ctaSecondary, { backgroundColor: c.card, borderColor: c.border }, pressed && { opacity: 0.75 }]}>
                  <Text style={[s.ctaSecondaryText, { color: c.foreground }]}>Watch the demo</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ── Tab bar ── */}
          <View style={[s.tabBar, { backgroundColor: c.card, borderColor: c.border }]}>
            {(['overview', 'features', 'pricing'] as const).map(t => (
              <Pressable key={t} style={[s.tabItem, tab === t && [s.tabItemActive, { backgroundColor: c.background, borderColor: c.border }]]} onPress={() => setTab(t)}>
                <Text style={[s.tabText, { color: tab === t ? c.foreground : c.mutedForeground }, tab === t && { fontWeight: '600' }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <View style={s.section}>
              {/* Section header */}
              <View style={s.sectionHead}>
                <Sparkles size={14} color={PRIMARY} strokeWidth={2} />
                <Text style={[s.sectionTitle, { color: c.foreground }]}>Your venue at a glance</Text>
              </View>
              <Text style={[s.sectionNote, { color: c.mutedForeground }]}>Preview using demo data. Full suite ships with a claimed venue.</Text>

              {/* Metrics — 2-col grid, gap 10 */}
              <View style={s.metricsGrid}>
                {DEMO_METRICS.map((m, i) => (
                  <View key={i} style={[s.metricCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[s.metricValue, { color: c.foreground }]}>{m.value}</Text>
                    <Text style={[s.metricLabel, { color: c.mutedForeground }]}>{m.label}</Text>
                    <Text style={[s.metricDelta, { color: m.up ? '#5DB18A' : '#D9462E' }]}>{m.delta}</Text>
                  </View>
                ))}
              </View>

              {/* Chart card */}
              <View style={[s.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[s.chartTitle, { color: c.foreground }]}>Wait time — last 7 days</Text>
                <View style={s.chartBars}>
                  {[28, 35, 31, 42, 67, 58, 24].map((h, i) => (
                    <View key={i} style={s.barCol}>
                      <View style={[s.bar, { height: h * 1.1 }]}>
                        <LinearGradient
                          colors={i === 4 ? [PRIMARY, PRIMARY_GLOW] : [c.border, c.border]}
                          style={{ flex: 1, borderRadius: 4 }}
                        />
                      </View>
                      <Text style={[s.barLabel, { color: i === 4 ? PRIMARY : c.mutedForeground }, i === 4 && { fontWeight: '700' }]}>
                        {['M','T','W','T','F','S','S'][i]}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[s.chartNote, { color: PRIMARY }]}>Peak: Friday · 9pm · 67 min avg</Text>
              </View>

              {/* Competitor card */}
              <View style={[s.compCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={s.compHead}>
                  <BarChart2 size={14} color={PRIMARY} strokeWidth={2} />
                  <Text style={[s.compTitle, { color: c.foreground }]}>Competitor Pulse</Text>
                  <View style={[s.proBadge, { backgroundColor: primaryTint12 }]}>
                    <Text style={s.proBadgeText}>PRO</Text>
                  </View>
                </View>
                {[
                  { name: 'Your venue', wait: 28, you: true  },
                  { name: 'Venue A',    wait: 39, you: false },
                  { name: 'Venue B',    wait: 45, you: false },
                  { name: 'Venue C',    wait: 58, you: false },
                ].map((item, i) => (
                  <View key={i} style={s.compRow}>
                    <Text style={[s.compName, { color: item.you ? PRIMARY : c.mutedForeground }, item.you && { fontWeight: '700' }]}>
                      {item.you ? '◆ ' : ''}{item.name}
                    </Text>
                    <View style={[s.compTrack, { backgroundColor: c.border }]}>
                      <View style={[s.compFill, { width: `${(item.wait / 70) * 100}%` as any, backgroundColor: item.you ? PRIMARY : c.border }]} />
                    </View>
                    <Text style={[s.compWait, { color: item.you ? PRIMARY : c.mutedForeground }]}>{item.wait}m</Text>
                  </View>
                ))}
                <Text style={[s.compFooter, { color: c.mutedForeground }]}>Competitor names revealed on Enterprise plan</Text>
              </View>
            </View>
          )}

          {/* ── Features ── */}
          {tab === 'features' && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Sparkles size={14} color={PRIMARY} strokeWidth={2} />
                <Text style={[s.sectionTitle, { color: c.foreground }]}>What's inside</Text>
              </View>

              {/* grid-cols-1 sm:grid-cols-2 gap-2.5 (10px) — card-lift, staggered */}
              <View style={s.featGrid}>
                {SUITE_FEATURES.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <View key={i} style={[s.featCard, { backgroundColor: c.card, borderColor: c.border }]}>
                      {/* Icon tile — h-9 w-9 (36), rounded-xl (14), primary 12% bg */}
                      <View style={[s.featIconTile, { backgroundColor: primaryTint12 }]}>
                        <Icon size={16} color={PRIMARY} strokeWidth={2} />
                      </View>
                      {/* Title — text-sm bold tracking-tight font-display */}
                      <Text style={[s.featTitle, { color: c.foreground }]}>{f.title}</Text>
                      {/* Desc — mt-2, text-[12px], muted */}
                      <Text style={[s.featDesc, { color: c.mutedForeground }]}>{f.desc}</Text>
                    </View>
                  )
                })}
              </View>
              <Text style={[s.footerNote, { color: c.mutedForeground }]}>Preview using demo data. Full suite ships with a claimed venue.</Text>
            </View>
          )}

          {/* ── Pricing ── */}
          {tab === 'pricing' && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Sparkles size={14} color={PRIMARY} strokeWidth={2} />
                <Text style={[s.sectionTitle, { color: c.foreground }]}>Simple pricing</Text>
              </View>
              {PLANS.map((plan, i) => (
                <View key={i} style={[s.planCard, { backgroundColor: c.card, borderColor: plan.highlight ? PRIMARY : c.border }, plan.highlight && { borderWidth: 1.5 }]}>
                  {plan.highlight && (
                    <View style={[s.popularBadge, { backgroundColor: PRIMARY }]}>
                      <Text style={s.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={[s.planName, { color: c.mutedForeground }]}>{plan.name}</Text>
                  <View style={s.planPriceRow}>
                    <Text style={[s.planPrice, { color: plan.highlight ? PRIMARY : c.foreground }]}>{plan.price}</Text>
                    <Text style={[s.planPeriod, { color: c.mutedForeground }]}>{plan.period}</Text>
                  </View>
                  {plan.features.map((f, j) => (
                    <View key={j} style={s.planFeatureRow}>
                      <Text style={[s.planCheck, { color: plan.highlight ? PRIMARY : '#5DB18A' }]}>✓</Text>
                      <Text style={[s.planFeatureText, { color: c.foreground }]}>{f}</Text>
                    </View>
                  ))}
                  <Pressable style={[s.planBtn, plan.highlight && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}>
                    <Text style={[s.planBtnText, { color: plan.highlight ? '#FFFFFF' : c.foreground }]}>
                      {i === 2 ? 'Contact us' : 'Get started'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

// ─── Styles — all using design system tokens ──────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // Ambient layers
  ambientTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 460, zIndex: -1 },
  ambientBlob: {
    position: 'absolute', right: -96, top: 64, zIndex: -1,
    width: 300, height: 300, borderRadius: 9999,
    backgroundColor: 'rgba(248,104,43,0.40)', opacity: 0.30,
  },

  // Header — px-5 pt-5
  header: { paddingHorizontal: 20, paddingTop: 20 },
  backChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  backText: { fontSize: 12, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Hero row — mt-5, px-5, flex items-start gap-3
  heroRow: { marginTop: 20, paddingHorizontal: 20, flexDirection: 'column', gap: 12 },

  // Diamond tile — h-14 w-14 (56), rounded-2xl (22), shadow-glow
  heroTile: {
    width: 56, height: 56, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 12, elevation: 6,
  },
  heroGlyph: { fontSize: 24, color: '#FFFFFF' },

  // Hero badge — text-[9px] uppercase tracking
  heroBadge: { alignSelf: 'flex-start', borderRadius: 9999, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
  heroBadgeText: { fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 1.4, textTransform: 'uppercase', fontFamily: fontFamily.accent },

  // H1 — text-[26px] extrabold leading-[1.05] tracking-tight font-display
  heroH1: { fontSize: 26, fontWeight: '800', lineHeight: 27, letterSpacing: -0.5, fontFamily: fontFamily.displayBold, marginBottom: 12 },

  // Subhead — text-[13px] muted mt-3
  heroSub: { fontSize: 13, lineHeight: 19, fontFamily: fontFamily.body, marginBottom: 16 },

  // CTA row — mt-4 flex-wrap gap-2
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ctaPrimary: {
    height: 38, borderRadius: 9999, paddingHorizontal: 16,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.40, shadowRadius: 8, elevation: 4,
  },
  ctaPrimaryText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', fontFamily: fontFamily.display },
  ctaSecondary: {
    height: 38, borderRadius: 9999, paddingHorizontal: 16,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  ctaSecondaryText: { fontSize: 13, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Tab bar
  tabBar: { flexDirection: 'row', marginHorizontal: 20, marginTop: 24, marginBottom: 16, borderRadius: 12, borderWidth: 1, padding: 3 },
  tabItem: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { borderWidth: 1 },
  tabText: { fontSize: 13, fontFamily: fontFamily.body },

  // Section
  section: { paddingHorizontal: 20, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, fontFamily: fontFamily.display },
  sectionNote: { fontSize: 11, fontFamily: fontFamily.body, marginTop: -4 },

  // Metrics grid — 2 col, gap 10
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: (width - 40 - 10) / 2, borderRadius: 16, borderWidth: 1, padding: 14, gap: 3 },
  metricValue: { fontSize: 22, fontWeight: '800', fontFamily: fontFamily.displayBold },
  metricLabel: { fontSize: 11, fontFamily: fontFamily.body },
  metricDelta: { fontSize: 11, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Chart
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  chartTitle: { fontSize: 13, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 },
  barCol: { flex: 1, alignItems: 'center', gap: 5, justifyContent: 'flex-end', height: 90 },
  bar: { width: '100%', borderRadius: 4, overflow: 'hidden' },
  barLabel: { fontSize: 10, fontFamily: fontFamily.body },
  chartNote: { fontSize: 11, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Competitor
  compCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  compHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compTitle: { fontSize: 13, fontWeight: '600', fontFamily: fontFamily.bodySemiBold, flex: 1 },
  proBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  proBadgeText: { fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 0.8 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compName: { fontSize: 12, fontFamily: fontFamily.body, width: 80 },
  compTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  compFill: { height: '100%', borderRadius: 3 },
  compWait: { fontSize: 12, fontWeight: '600', width: 30, textAlign: 'right' },
  compFooter: { fontSize: 10, fontFamily: fontFamily.body, fontStyle: 'italic' },

  // Features grid — 2 col, gap 10
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featCard: { width: (width - 40 - 10) / 2, borderRadius: 16, borderWidth: 1, padding: 16, gap: 0 },
  featIconTile: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2, fontFamily: fontFamily.display },
  featDesc: { fontSize: 12, lineHeight: 17, fontFamily: fontFamily.body, marginTop: 8 },
  footerNote: { textAlign: 'center', fontSize: 11, fontFamily: fontFamily.body, marginTop: 4 },

  // Pricing
  planCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 8 },
  popularBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4 },
  popularText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.8 },
  planName: { fontSize: 13, fontWeight: '500', fontFamily: fontFamily.body },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 4 },
  planPrice: { fontSize: 34, fontWeight: '800', fontFamily: fontFamily.displayBold },
  planPeriod: { fontSize: 14, fontFamily: fontFamily.body },
  planFeatureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  planCheck: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  planFeatureText: { fontSize: 13, fontFamily: fontFamily.body, flex: 1 },
  planBtn: { height: 44, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 6, borderColor: '#EDE6DD' },
  planBtnText: { fontSize: 14, fontWeight: '700', fontFamily: fontFamily.display },
})
