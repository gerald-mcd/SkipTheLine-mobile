import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'

type Severity = 'short' | 'moderate' | 'long'

interface WaitBadgeProps {
  minutes: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'chip' | 'pill'
}

function getSeverity(minutes: number): Severity {
  if (minutes <= 15) return 'short'
  if (minutes <= 45) return 'moderate'
  return 'long'
}

const SEVERITY_COLORS: Record<Severity, string> = {
  short:    '#5DB18A',
  moderate: '#D69A3F',
  long:     '#D9462E',
}

const TINT_COLORS: Record<Severity, string> = {
  short:    'rgba(93,177,138,0.12)',
  moderate: 'rgba(214,154,63,0.12)',
  long:     'rgba(217,70,46,0.12)',
}

const FONT_SIZES: Record<'sm' | 'md' | 'lg', number> = {
  sm: 10,
  md: 12,
  lg: 16,
}

const PADDING_H: Record<'sm' | 'md' | 'lg', number> = {
  sm: 6,
  md: 8,
  lg: 10,
}

const PADDING_V: Record<'sm' | 'md' | 'lg', number> = {
  sm: 2,
  md: 3,
  lg: 5,
}

export default function WaitBadge({
  minutes,
  size = 'md',
  variant = 'solid',
}: WaitBadgeProps) {
  const severity = getSeverity(minutes)
  const color = SEVERITY_COLORS[severity]
  const tint = TINT_COLORS[severity]
  const fontSize = FONT_SIZES[size]
  const padH = PADDING_H[size]
  const padV = PADDING_V[size]

  // Animated ring on value change
  const ringScale = useRef(new Animated.Value(1)).current
  const ringOpacity = useRef(new Animated.Value(0)).current
  const prevMinutes = useRef<number | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      prevMinutes.current = minutes
      return
    }

    if (prevMinutes.current !== minutes) {
      prevMinutes.current = minutes
      // Reset and fire animation
      ringScale.setValue(1)
      ringOpacity.setValue(0.9)
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [minutes, ringScale, ringOpacity])

  // Badge container styles per variant
  let badgeStyle: object
  let textColor: string

  if (variant === 'solid') {
    badgeStyle = {
      backgroundColor: color,
      paddingHorizontal: padH,
      paddingVertical: padV,
      borderRadius: 999,
    }
    textColor = '#FFFFFF'
  } else if (variant === 'chip') {
    badgeStyle = {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: padH,
      paddingVertical: padV,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: color,
    }
    textColor = color
  } else {
    // pill
    badgeStyle = {
      backgroundColor: tint,
      paddingHorizontal: padH,
      paddingVertical: padV,
      borderRadius: 999,
    }
    textColor = color
  }

  return (
    <View style={styles.wrapper}>
      {/* Animated ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: color,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
        pointerEvents="none"
      />
      {/* Badge */}
      <View style={badgeStyle}>
        <Text style={[styles.text, { fontSize, color: textColor, fontWeight: '700' }]}>
          {minutes}m
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
  },
  text: {
    fontWeight: '700',
  },
})
