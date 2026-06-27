import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ChevronLeft, Clock, Users, TrendingUp,
  Calendar, Shield, Download, BarChart2,
} from 'lucide-react-native'
// ChevronRight removed — not used
import { fontFamily, spacing } from '@/constants/theme'

const { width } = Dimensions.get('window')

// App color tokens — matches rest of app
const PRIMARY   = '#F8682B'
const BG        = '#FCFBF9'
const CARD      = '#FFFFFF'
const BORDER    = '#EDE6DD'
const FG        = '#33384A'
const MUTED     = '#857565'
// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <Clock size={16} color={PRIMARY} strokeWidth={2} />,      title: 'Wait Intel',        desc: 'Hour-by-hour wait curves, peak windows, weekend vs. weekday deltas.' },
  { icon: <Users size={16} color={PRIMARY} strokeWidth={2} />,      title: 'Foot Traffic',      desc: 'Reporter density, dwell time, walk-by share for your venue.' },
  { icon: <TrendingUp size={16} color={PRIMARY} strokeWidth={2} />, title: 'Competitor Pulse',  desc: 'How your line compares to the 5 closest venues in your category.' },
  { icon: <Calendar size={16} color={PRIMARY} strokeWidth={2} />,   title: 'Event Lift',        desc: 'What concerts, games and weather did to demand last week.' },
  { icon: <Shield size={16} color={PRIMARY} strokeWidth={2} />,     title: 'Reporter Quality',  desc: 'Confidence-weighted reports, dispute rate, anomaly flags.' },
  { icon: <Download size={16} color={PRIMARY} strokeWidth={2} />,   title: 'CSV Exports',       desc: 'Pull every metric into your BI tool. White-glove onboarding.' },
]

// ─── Demo metrics ─────────────────────────────────────────────────────────────

const DEMO_METRICS = [
  { label: 'Avg wait this week',    value: '28m',   delta: '↓ 6m vs last week',      up: true  },
  { label: 'Peak hour',             value: 'Fri 9p', delta: '67 min avg',             up: false },
  { label: 'Category rank',         value: '#2/8',  delta: 'Top 25% efficiency',      up: true  },
  { label: 'Venue views',           value: '1.2k',  delta: '↑ 18% vs last week',      up: true  },
]

// ─── Pricing plans ────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Basic', price: '$29', period: '/mo',
    features: ['Wait Intel', 'Venue analytics', 'Weekly email report', '1 venue'],
    highlight: false,
  },
  {
    name: 'Pro', price: '$99', period: '/mo',
    features: ['Everything in Basic', 'Foot Traffic', 'Competitor Pulse', 'Event Lift', '3 venues'],
    highlight: true,
  },
  {
    name: 'Enterprise', price: '$199', period: '/mo',
    features: ['Everything in Pro', 'Named competitors', 'CSV exports', 'Reporter Quality', 'Unlimited venues', 'White-glove onboarding'],
    highlight: false,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'features' | 'pricing'>('overview')

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header — matches venue detail back button style */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={FG} strokeWidth={2.5} />
        </Pressable>
        <Text style={s.headerTitle}>Business Suite</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero card — dark, premium feel, but uses app fonts/radius */}
        <View style={s.heroWrap}>
          <View style={s.heroCard}>
            <LinearGradient
              colors={['#1C1A26', '#2A2040']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Orange accent line at top */}
            <View style={s.accentLine} />

            <View style={s.heroInner}>
              {/* Diamond */}
              <LinearGradient
                colors={['#F8682B', '#F2934D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.heroDiamond}
              >
                <Text style={s.heroDiamondIcon}>◆</Text>
              </LinearGradient>

              <Text style={s.heroEyebrow}>PREMIUM PASS · FOR BUSINESS OWNERS</Text>
              <Text style={s.heroTitle}>Turn your line{'\n'}into your edge.</Text>
              <Text style={s.heroSub}>
                Live wait intel, foot-traffic patterns, competitor pulse and event lift — built from the same crowd signal powering SkipTheLine. From $29–$199/mo.
              </Text>

              {/* CTA row */}
              <View style={s.heroCtas}>
                <Pressable style={({ pressed }) => [s.ctaPrimary, pressed && { opacity: 0.88 }]}>
                  <Text style={s.ctaPrimaryText}>Request early access</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [s.ctaSecondary, pressed && { opacity: 0.75 }]}>
                  <Text style={s.ctaSecondaryText}>Watch the demo</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Tab bar — app style */}
        <View style={s.tabBar}>
          {(['overview', 'features', 'pricing'] as const).map(t => (
            <Pressable key={t} style={[s.tabItem, tab === t && s.tabItemActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Your venue at a glance</Text>
            <Text style={s.sectionNote}>Preview using demo data. Full suite ships with a claimed venue.</Text>

            {/* Metrics grid — app card style */}
            <View style={s.metricsGrid}>
              {DEMO_METRICS.map((m, i) => (
                <View key={i} style={s.metricCard}>
                  <Text style={s.metricValue}>{m.value}</Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                  <Text style={[s.metricDelta, { color: m.up ? '#5DB18A' : '#D9462E' }]}>{m.delta}</Text>
                </View>
              ))}
            </View>

            {/* Wait time chart */}
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>Wait time — last 7 days</Text>
              <View style={s.chartBars}>
                {[28, 35, 31, 42, 67, 58, 24].map((h, i) => (
                  <View key={i} style={s.barCol}>
                    <View style={[s.bar, { height: h * 1.1 }]}>
                      <LinearGradient
                        colors={i === 4 ? [PRIMARY, '#FFB37A'] : ['#EDE6DD', '#EDE6DD']}
                        style={{ flex: 1, borderRadius: 4 }}
                      />
                    </View>
                    <Text style={[s.barLabel, i === 4 && { color: PRIMARY, fontWeight: '700' }]}>
                      {['M','T','W','T','F','S','S'][i]}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={s.chartNote}>Peak: Friday · 9pm · 67 min avg</Text>
            </View>

            {/* Competitor snapshot */}
            <View style={s.competitorCard}>
              <View style={s.competitorHead}>
                <BarChart2 size={14} color={PRIMARY} strokeWidth={2} />
                <Text style={s.competitorTitle}>Competitor Pulse</Text>
                <View style={s.proBadge}><Text style={s.proBadgeText}>PRO</Text></View>
              </View>
              {[
                { name: 'Your venue', wait: 28, you: true  },
                { name: 'Venue A',    wait: 39, you: false },
                { name: 'Venue B',    wait: 45, you: false },
                { name: 'Venue C',    wait: 58, you: false },
              ].map((c, i) => (
                <View key={i} style={s.competitorRow}>
                  <Text style={[s.competitorName, c.you && { color: PRIMARY, fontWeight: '700' }]}>
                    {c.you ? '◆ ' : ''}{c.name}
                  </Text>
                  <View style={s.competitorTrack}>
                    <View style={[s.competitorFill, {
                      width: `${(c.wait / 70) * 100}%` as any,
                      backgroundColor: c.you ? PRIMARY : BORDER,
                    }]} />
                  </View>
                  <Text style={[s.competitorWait, c.you && { color: PRIMARY }]}>{c.wait}m</Text>
                </View>
              ))}
              <Text style={s.competitorFooter}>Competitor names revealed on Enterprise plan</Text>
            </View>
          </View>
        )}

        {/* ── Features ── */}
        {tab === 'features' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>What's inside</Text>
            <View style={s.featGrid}>
              {FEATURES.map((f, i) => (
                <View key={i} style={s.featCard}>
                  <View style={s.featIcon}>{f.icon}</View>
                  <Text style={s.featTitle}>{f.title}</Text>
                  <Text style={s.featDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Pricing ── */}
        {tab === 'pricing' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Simple pricing</Text>
            {PLANS.map((plan, i) => (
              <View key={i} style={[s.planCard, plan.highlight && s.planCardHighlight]}>
                {plan.highlight && (
                  <View style={s.popularBadge}>
                    <Text style={s.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={s.planTop}>
                  <Text style={s.planName}>{plan.name}</Text>
                  <View style={s.planPriceRow}>
                    <Text style={[s.planPrice, plan.highlight && { color: PRIMARY }]}>{plan.price}</Text>
                    <Text style={s.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                {plan.features.map((f, j) => (
                  <View key={j} style={s.planFeature}>
                    <Text style={[s.planCheck, plan.highlight && { color: PRIMARY }]}>✓</Text>
                    <Text style={s.planFeatureText}>{f}</Text>
                  </View>
                ))}
                <Pressable style={[s.planBtn, plan.highlight && s.planBtnHighlight]}>
                  <Text style={[s.planBtnText, plan.highlight && { color: '#FFFFFF' }]}>
                    {i === 2 ? 'Contact us' : 'Get started'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles — all using app design tokens ─────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EBE5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: FG, fontFamily: fontFamily.display },

  // Hero card
  heroWrap: { paddingHorizontal: spacing.md, paddingTop: 4, paddingBottom: 16 },
  heroCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(248,104,43,0.20)' },
  accentLine: { height: 3, backgroundColor: PRIMARY, width: 40, marginLeft: 18, marginTop: 18, borderRadius: 2 },
  heroInner: { padding: 18, paddingTop: 12, gap: 10 },
  heroDiamond: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroDiamondIcon: { fontSize: 18, color: '#FFFFFF' },
  heroEyebrow: { fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 1.2, fontFamily: fontFamily.accent },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', fontFamily: fontFamily.displayBold, letterSpacing: -0.5, lineHeight: 30 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 19, fontFamily: fontFamily.body },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  ctaPrimary: { height: 42, borderRadius: 999, paddingHorizontal: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', fontFamily: fontFamily.display },
  ctaSecondary: { height: 42, borderRadius: 999, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  ctaSecondaryText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', fontFamily: fontFamily.bodySemiBold },

  // Tab bar
  tabBar: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: 16, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 3 },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  tabText: { fontSize: 13, color: MUTED, fontFamily: fontFamily.body },
  tabTextActive: { color: FG, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Section
  section: { paddingHorizontal: spacing.md, gap: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: FG, fontFamily: fontFamily.display, letterSpacing: -0.2 },
  sectionNote: { fontSize: 12, color: MUTED, fontFamily: fontFamily.body, marginTop: -6 },

  // Metrics — app card style
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: (width - spacing.md * 2 - 10) / 2, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 3 },
  metricValue: { fontSize: 24, fontWeight: '800', color: FG, fontFamily: fontFamily.displayBold },
  metricLabel: { fontSize: 11, color: MUTED, fontFamily: fontFamily.body },
  metricDelta: { fontSize: 11, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Chart
  chartCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  chartTitle: { fontSize: 13, fontWeight: '600', color: FG, fontFamily: fontFamily.bodySemiBold },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: 90 },
  bar: { width: '100%', borderRadius: 4, overflow: 'hidden' },
  barLabel: { fontSize: 10, color: MUTED, fontFamily: fontFamily.body },
  chartNote: { fontSize: 11, color: PRIMARY, fontFamily: fontFamily.body, fontWeight: '600' },

  // Competitor
  competitorCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  competitorHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  competitorTitle: { fontSize: 13, fontWeight: '600', color: FG, fontFamily: fontFamily.bodySemiBold, flex: 1 },
  proBadge: { backgroundColor: '#FFF0E8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  proBadgeText: { fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 0.8 },
  competitorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  competitorName: { fontSize: 12, color: MUTED, fontFamily: fontFamily.body, width: 80 },
  competitorTrack: { flex: 1, height: 6, backgroundColor: '#F5F0EB', borderRadius: 3, overflow: 'hidden' },
  competitorFill: { height: '100%', borderRadius: 3 },
  competitorWait: { fontSize: 12, fontWeight: '600', color: MUTED, width: 30, textAlign: 'right' },
  competitorFooter: { fontSize: 10, color: MUTED, fontFamily: fontFamily.body, fontStyle: 'italic' },

  // Features
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featCard: { width: (width - spacing.md * 2 - 10) / 2, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 8 },
  featIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center' },
  featTitle: { fontSize: 14, fontWeight: '700', color: FG, fontFamily: fontFamily.display },
  featDesc: { fontSize: 12, color: MUTED, lineHeight: 17, fontFamily: fontFamily.body },

  // Pricing
  planCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 18, gap: 8 },
  planCardHighlight: { borderColor: PRIMARY, borderWidth: 1.5 },
  popularBadge: { backgroundColor: PRIMARY, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4 },
  popularText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.8 },
  planTop: { gap: 2 },
  planName: { fontSize: 14, fontWeight: '600', color: MUTED, fontFamily: fontFamily.body },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 34, fontWeight: '800', color: FG, fontFamily: fontFamily.displayBold },
  planPeriod: { fontSize: 14, color: MUTED, fontFamily: fontFamily.body },
  planFeature: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  planCheck: { fontSize: 13, color: '#5DB18A', fontWeight: '700', marginTop: 1 },
  planFeatureText: { fontSize: 13, color: FG, fontFamily: fontFamily.body, flex: 1 },
  planBtn: { height: 46, borderRadius: 999, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  planBtnHighlight: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  planBtnText: { fontSize: 14, fontWeight: '700', color: FG, fontFamily: fontFamily.display },
})
