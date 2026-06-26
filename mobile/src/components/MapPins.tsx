import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { getWaitColorFromMinutes } from '@/lib/map-style'
import { fontFamily } from '@/constants/theme'

// ─── Dot Pin — unselected venue, just a colored circle ───────────────────────
// Small, clean, no text — color tells the whole story
export function WaitDotPin({ minutes }: { minutes: number | null }) {
  const color = getWaitColorFromMinutes(minutes)
  return (
    <View style={[dotStyles.outer, { borderColor: color }]}>
      <View style={[dotStyles.inner, { backgroundColor: color }]} />
    </View>
  )
}

const dotStyles = StyleSheet.create({
  outer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  inner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

// ─── Teardrop Pin — selected/tapped venue, shows wait time ───────────────────
// Classic droplet shape, color fill, white wait time text inside
export function WaitTearDropPin({ minutes }: { minutes: number | null }) {
  const color = getWaitColorFromMinutes(minutes)
  const label = minutes === null ? '?' : minutes === 0 ? 'Now' : `${minutes}m`

  return (
    <View style={tearStyles.container}>
      {/* Bubble */}
      <View style={[tearStyles.bubble, { backgroundColor: color }]}>
        <Text style={tearStyles.label}>{label}</Text>
      </View>
      {/* Tail */}
      <View style={[tearStyles.tail, { borderTopColor: color }]} />
    </View>
  )
}

const tearStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },
  bubble: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: fontFamily.displayBold,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
})
