import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ChevronLeft, ChevronRight, Clock, Users, BarChart2,
  Calendar, Shield, Download, TrendingUp,
} from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'

const { width } = Dimensions.get('window')

const PRIMARY   = '#F8682B'
const DARK_BG   = '#0F0B1E'
const CARD_BG   = '#1A1530'
const BORDER    = 'rgba(255,255,255,0.08)'
const MUTED     = 'rgba(255,255,255,0.55)'
const WHITE     = '#FFFFFF'

// ─── Feature grid ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Clock size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'Wait Intel',
    desc: 'Hour-by-hour wait curves, peak windows, weekend vs. weekday deltas.',
  },
  {
    icon: <Users size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'Foot Traffic',
    desc: 'Reporter density, dwell time, walk-by share for your venue.',
  },
  {
    icon: <TrendingUp size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'Competitor Pulse',
    desc: 'How your line compares to the 5 closest venues in your category.',
  },
  {
    icon: <Calendar size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'Event Lift',
    desc: 'What concerts, games and weather did to demand last week.',
  },
  {
    icon: <Shield size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'Reporter Quality',
    desc: 'Confidence-weighted reports, dispute rate, anomaly flags.',
  },
  {
    icon: <Download size={18} color={PRIMARY} strokeWidth={2} />,
    title: 'CSV Exports',
    desc: 'Pull every metric into your BI tool. White-glove onboarding.',
  },
]

// ─── Demo metrics ─────────────────────────────────────────────────────────────

const DEMO_METRICS = [
  { label: 'Avg wait this week',   value: '28 min',  delta: '↓ 6 min vs last week', positive: true },
  { label: 'Peak hour',            value: 'Fri 9pm', delta: '67 min avg',            positive: false },
  { label: 'Category rank',        value: '#2 of 8', delta: 'Top 25% efficiency',    positive: true },
  { label: 'Venue views this week',value: '1,240',   delta: '↑ 18% vs last week',   positive: true },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'pricing'>('overview')

  return (
    <View style={s.root}>
      {/* Deep purple gradient background */}
      <LinearGradient
        colors={['#0F0B1E', '#1A1040', '#0F0B1E']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={20} color={WHITE} strokeWidth={2.5} />
            <Text style={s.backText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Hero */}
          <View style={s.hero}>
            {/* Diamond icon */}
            <View style={s.diamondWrap}>
              <LinearGradient
                colors={['#6B4FBB', '#9B6FE8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.diamond}
              >
                <Text style={s.diamondIcon}>◆</Text>
              </LinearGradient>
            </View>
            <Text style={s.heroEyebrow}>PREMIUM PASS · FOR BUSINESS OWNERS</Text>
            <Text style={s.heroTitle}>Turn your line{'\n'}into your edge.</Text>
            <Text style={s.heroSub}>
              Live wait intel, foot-traffic patterns, competitor pulse and event
              lift — built from the same crowd signal powering SkipTheLine.
              {'\n'}From $29–$199/mo.
            </Text>

            {/* CTA buttons */}
            <View style={s.ctaRow}>
              <Pressable style={({ pressed }) => [s.ctaPrimary, pressed && { opacity: 0.88 }]}>
                <Text style={s.ctaPrimaryText}>Request early access</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [s.ctaSecondary, pressed && { opacity: 0.75 }]}>
                <Text style={s.ctaSecondaryText}>Watch the demo</Text>
              </Pressable>
            </View>
          </View>

          {/* Tab bar */}
          <View style={s.tabs}>
            {(['overview', 'features', 'pricing'] as const).map(tab => (
              <Pressable
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Overview tab — demo metrics */}
          {activeTab === 'overview' && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Your venue at a glance</Text>
              <Text style={s.sectionSub}>Preview using demo data. Full suite ships with a claimed venue.</Text>
              <View style={s.metricsGrid}>
                {DEMO_METRICS.map((m, i) => (
                  <View key={i} style={s.metricCard}>
                    <Text style={s.metricValue}>{m.value}</Text>
                    <Text style={s.metricLabel}>{m.label}</Text>
                    <Text style={[s.metricDelta, { color: m.positive ? '#5DB18A' : '#D9462E' }]}>
                      {m.delta}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Sample chart placeholder */}
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>Wait time — last 7 days</Text>
                <View style={s.chartBars}>
                  {[28, 35, 31, 42, 67, 58, 24].map((h, i) => (
                    <View key={i} style={s.barWrap}>
                      <View style={[s.bar, { height: h * 1.2, opacity: i === 4 ? 1 : 0.5 }]}>
                        <LinearGradient
                          colors={[PRIMARY, '#FFB37A']}
                          style={{ flex: 1, borderRadius: 4 }}
                        />
                      </View>
                      <Text style={s.barLabel}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={s.chartNote}>Peak: Friday · 9pm · 67 min avg</Text>
              </View>

              {/* Competitor snapshot */}
              <View style={s.competitorCard}>
                <View style={s.competitorHeader}>
                  <BarChart2 size={14} color={PRIMARY} />
                  <Text style={s.competitorTitle}>Competitor pulse</Text>
                  <View style={s.competitorBadge}><Text style={s.competitorBadgeText}>PRO</Text></View>
                </View>
                {[
                  { label: 'Your venue',  wait: 28, rank: 1, you: true },
                  { label: 'Venue A',     wait: 39, rank: 2, you: false },
                  { label: 'Venue B',     wait: 45, rank: 3, you: false },
                  { label: 'Venue C',     wait: 51, rank: 4, you: false },
                ].map((c, i) => (
                  <View key={i} style={s.competitorRow}>
                    <Text style={[s.competitorName, c.you && { color: PRIMARY, fontWeight: '700' }]}>
                      {c.you ? '◆ ' : ''}{c.label}
                    </Text>
                    <View style={s.competitorBar}>
                      <View style={[s.competitorFill, {
                        width: `${(c.wait / 60) * 100}%` as any,
                        backgroundColor: c.you ? PRIMARY : 'rgba(255,255,255,0.2)',
                      }]} />
                    </View>
                    <Text style={[s.competitorWait, c.you && { color: PRIMARY }]}>{c.wait}m</Text>
                  </View>
                ))}
                <Text style={s.competitorNote}>Competitor names revealed on Enterprise plan</Text>
              </View>
            </View>
          )}

          {/* Features tab */}
          {activeTab === 'features' && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>What's inside</Text>
              <View style={s.featuresGrid}>
                {FEATURES.map((f, i) => (
                  <View key={i} style={s.featureCard}>
                    <View style={s.featureIcon}>{f.icon}</View>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pricing tab */}
          {activeTab === 'pricing' && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Simple pricing</Text>
              {[
                {
                  name: 'Basic',
                  price: '$29',
                  period: '/mo',
                  features: ['Wait Intel', 'Venue analytics', 'Weekly email report', '1 venue'],
                  cta: 'Get started',
                  highlight: false,
                },
                {
                  name: 'Pro',
                  price: '$99',
                  period: '/mo',
                  features: ['Everything in Basic', 'Foot Traffic', 'Competitor Pulse', 'Event Lift', '3 venues'],
                  cta: 'Most popular',
                  highlight: true,
                },
                {
                  name: 'Enterprise',
                  price: '$199',
                  period: '/mo',
                  features: ['Everything in Pro', 'Named competitors', 'CSV exports', 'Reporter Quality', 'Unlimited venues', 'White-glove onboarding'],
                  cta: 'Contact us',
                  highlight: false,
                },
              ].map((plan, i) => (
                <View key={i} style={[s.pricingCard, plan.highlight && s.pricingCardHighlight]}>
                  {plan.highlight && (
                    <View style={s.popularBadge}>
                      <Text style={s.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={s.planName}>{plan.name}</Text>
                  <View style={s.planPriceRow}>
                    <Text style={s.planPrice}>{plan.price}</Text>
                    <Text style={s.planPeriod}>{plan.period}</Text>
                  </View>
                  {plan.features.map((f, j) => (
                    <View key={j} style={s.planFeatureRow}>
                      <Text style={s.planCheck}>✓</Text>
                      <Text style={s.planFeatureText}>{f}</Text>
                    </View>
                  ))}
                  <Pressable style={[s.planCta, plan.highlight && s.planCtaHighlight]}>
                    <Text style={[s.planCtaText, plan.highlight && { color: WHITE }]}>{plan.cta}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: DARK_BG },
  scroll: { paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, color: WHITE, fontFamily: fontFamily.body },

  // Hero
  hero: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, alignItems: 'flex-start' },
  diamondWrap: { marginBottom: 16 },
  diamond: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  diamondIcon: { fontSize: 20, color: WHITE },
  heroEyebrow: { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 1.2, fontFamily: fontFamily.accent, marginBottom: 8 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: -0.5, fontFamily: fontFamily.displayBold, lineHeight: 36, marginBottom: 12 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 20, fontFamily: fontFamily.body, marginBottom: 20 },

  ctaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  ctaPrimary: { height: 44, borderRadius: 999, paddingHorizontal: 20, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryText: { fontSize: 14, fontWeight: '700', color: DARK_BG, fontFamily: fontFamily.display },
  ctaSecondary: { height: 44, borderRadius: 999, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' },
  ctaSecondaryText: { fontSize: 14, fontWeight: '600', color: WHITE, fontFamily: fontFamily.bodySemiBold },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  tabText: { fontSize: 13, color: MUTED, fontFamily: fontFamily.body },
  tabTextActive: { color: WHITE, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Section
  section: { paddingHorizontal: 24, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: WHITE, fontFamily: fontFamily.display, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: MUTED, fontFamily: fontFamily.body, marginTop: -8 },

  // Metrics grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: (width - 48 - 10) / 2, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14 },
  metricValue: { fontSize: 22, fontWeight: '800', color: WHITE, fontFamily: fontFamily.displayBold, marginBottom: 2 },
  metricLabel: { fontSize: 11, color: MUTED, fontFamily: fontFamily.body, marginBottom: 4 },
  metricDelta: { fontSize: 11, fontWeight: '600', fontFamily: fontFamily.bodySemiBold },

  // Chart
  chartCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16 },
  chartTitle: { fontSize: 13, fontWeight: '600', color: WHITE, fontFamily: fontFamily.bodySemiBold, marginBottom: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 90, marginBottom: 8 },
  barWrap: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: 90 },
  bar: { width: '100%', borderRadius: 4, overflow: 'hidden' },
  barLabel: { fontSize: 10, color: MUTED, fontFamily: fontFamily.body },
  chartNote: { fontSize: 11, color: PRIMARY, fontFamily: fontFamily.body },

  // Competitor
  competitorCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 12 },
  competitorHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  competitorTitle: { fontSize: 13, fontWeight: '600', color: WHITE, fontFamily: fontFamily.bodySemiBold, flex: 1 },
  competitorBadge: { backgroundColor: 'rgba(248,104,43,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  competitorBadgeText: { fontSize: 9, fontWeight: '700', color: PRIMARY, letterSpacing: 0.8 },
  competitorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  competitorName: { fontSize: 12, color: 'rgba(255,255,255,0.70)', fontFamily: fontFamily.body, width: 80 },
  competitorBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  competitorFill: { height: '100%', borderRadius: 3 },
  competitorWait: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.70)', width: 28, textAlign: 'right' },
  competitorNote: { fontSize: 10, color: MUTED, fontFamily: fontFamily.body, fontStyle: 'italic' },

  // Features grid
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: { width: (width - 48 - 10) / 2, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 8 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(248,104,43,0.12)', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: WHITE, fontFamily: fontFamily.display },
  featureDesc: { fontSize: 12, color: MUTED, lineHeight: 17, fontFamily: fontFamily.body },

  // Pricing
  pricingCard: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, gap: 8 },
  pricingCardHighlight: { borderColor: PRIMARY, borderWidth: 1.5 },
  popularBadge: { backgroundColor: PRIMARY, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  popularBadgeText: { fontSize: 9, fontWeight: '800', color: WHITE, letterSpacing: 0.8 },
  planName: { fontSize: 16, fontWeight: '700', color: WHITE, fontFamily: fontFamily.display },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 },
  planPrice: { fontSize: 36, fontWeight: '800', color: WHITE, fontFamily: fontFamily.displayBold },
  planPeriod: { fontSize: 14, color: MUTED, fontFamily: fontFamily.body },
  planFeatureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  planCheck: { fontSize: 13, color: PRIMARY, fontWeight: '700', marginTop: 1 },
  planFeatureText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily.body, flex: 1 },
  planCta: { height: 46, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  planCtaHighlight: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  planCtaText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.70)', fontFamily: fontFamily.display },
})
