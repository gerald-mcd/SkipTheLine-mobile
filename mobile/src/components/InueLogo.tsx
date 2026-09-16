/**
 * Inue — Wordmark component
 *
 * The "u" in Inue is drawn as an open arc (ring with gap at top),
 * matching the brand mark exactly. The ring is sized and weighted
 * to sit where the letterform would, inline with "In" and "e".
 *
 * Usage:
 *   <InueLogo size={32} />          — default amber ring on dark bg
 *   <InueLogo size={20} color="#fff" ringColor="#ff8a3d" />
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

// ─── Inue brand colors ────────────────────────────────────────────────────────
export const INUE_AMBER  = '#ff8a3d'
export const INUE_INK    = '#11141c'
export const INUE_WHITE  = '#f3f1ec'
export const INUE_SLATE  = '#8b93a6'
export const INUE_GREEN  = '#35d07f'
export const INUE_SURFACE = '#181c27'
export const INUE_CARD   = '#232939'

interface InueLogoProps {
  /** Font size for the wordmark text — ring scales proportionally */
  size?: number
  /** Color of the "In" and "e" text */
  color?: string
  /** Color of the open ring (the "u") */
  ringColor?: string
}

export default function InueLogo({
  size = 32,
  color = INUE_WHITE,
  ringColor = INUE_AMBER,
}: InueLogoProps) {

  // Ring is ~0.56× the font size, border ~0.09× — mirrors the CSS exactly
  const ringSize    = size * 0.60
  const borderWidth = Math.max(2, size * 0.085)
  // Nudge ring down slightly so its base aligns with text baseline
  const ringOffset  = size * 0.05

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size, lineHeight: size * 1.1, color }]}>
        In
      </Text>

      {/* The ring IS the "u" */}
      <View
        style={[
          styles.ring,
          {
            width:            ringSize,
            height:           ringSize,
            borderRadius:     ringSize / 2,
            borderWidth,
            borderColor:      ringColor,
            borderTopColor:   'transparent',   // gap at top — never closes
            marginHorizontal: size * 0.025,
            marginTop:        ringOffset,
          },
        ]}
      />

      <Text style={[styles.text, { fontSize: size, lineHeight: size * 1.1, color }]}>
        e
      </Text>
    </View>
  )
}

// ─── Eyebrow tag (WAIT INTELLIGENCE · spinning ring) ─────────────────────────
export function InueEyebrow({ color = INUE_SLATE }: { color?: string }) {
  return (
    <View style={styles.eyebrowRow}>
      <View style={[styles.eyebrowRing, { borderTopColor: INUE_AMBER, borderRightColor: INUE_AMBER }]} />
      <Text style={[styles.eyebrowText, { color }]}>WAIT INTELLIGENCE</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'flex-end',
  },
  text: {
    fontFamily:    'SpaceGrotesk_700Bold',
    fontWeight:    '700',
    letterSpacing: -0.03 * 32,   // will be overridden by inline prop
  },
  ring: {
    // sizes set inline
  },
  eyebrowRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
  },
  eyebrowRing: {
    width:        14,
    height:       14,
    borderRadius: 7,
    borderWidth:  2,
    borderColor:  'rgba(243,241,236,0.18)',
    borderTopColor:   INUE_AMBER,
    borderRightColor: INUE_AMBER,
  },
  eyebrowText: {
    fontFamily:    'IBMPlexMono_500Medium',
    fontSize:      11,
    letterSpacing: 0.18 * 11,
    textTransform: 'uppercase',
  },
})
