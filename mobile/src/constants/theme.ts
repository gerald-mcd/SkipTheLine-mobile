// Light theme tokens (spec §3.1)
export const lightColors = {
  background:        '#FBFBFC',
  foreground:        '#33384A',
  surface:           '#FFFFFF',
  surfaceElevated:   '#F8F8FA',
  card:              '#FFFFFF',
  cardForeground:    '#33384A',
  primary:           '#E07A3B',
  primaryForeground: '#FFFCF7',
  primaryGlow:       '#F2934D',
  secondary:         '#F7F2EC',
  secondaryForeground: '#5A4632',
  muted:             '#F7F3EE',
  mutedForeground:   '#857565',
  accent:            '#F8EFE5',
  border:            '#EDE6DD',
  destructive:       '#D9462E',
  waitShort:         '#5DB18A',
  waitModerate:      '#D69A3F',
  waitLong:          '#D9462E',
  success:           '#5DB18A',
  warning:           '#D69A3F',
  white:             '#FFFFFF',
}

// Dark theme tokens (spec §3.2 — true black)
export const darkColors = {
  background:        '#0D0D0D',
  foreground:        '#F5F5F5',
  surface:           '#1A1A1A',
  surfaceElevated:   '#212121',
  card:              '#1C1C1C',
  cardForeground:    '#F5F5F5',
  primary:           '#EE9356',
  primaryForeground: '#141414',
  primaryGlow:       '#F4A66E',
  secondary:         '#292929',
  secondaryForeground: '#F5F5F5',
  muted:             '#262626',
  mutedForeground:   '#ADADAD',
  accent:            '#3A2A1E',
  border:            'rgba(238,147,86,0.22)',
  destructive:       '#E76144',
  waitShort:         '#73BF99',
  waitModerate:      '#F0AC57',
  waitLong:          '#E76144',
  success:           '#73BF99',
  warning:           '#F0AC57',
  white:             '#FFFFFF',
}

// Default export = light colors (theme provider swaps at runtime)
export const colors = {
  ...lightColors,
  // backward-compat aliases
  text:      lightColors.foreground,
  textMuted: lightColors.mutedForeground,
}

export const spacing = {
  xs:  4,   // 1
  sm:  8,   // 2
  md:  16,  // 4
  lg:  20,  // 5
  xl:  24,  // 6
  xxl: 32,  // 8
}

export const radius = {
  sm:   6,
  md:   12,
  lg:   14,
  xl:   18,
  xxl:  22,  // buttons
  xxxl: 26,
  full: 9999,
}

export const font = {
  xs:   10,
  sm:   12,  // wait badge sm
  base: 13,  // body small
  md:   14,  // body
  lg:   16,  // wait badge lg
  xl:   18,  // card title
  xxl:  28,  // page title
  xxxl: 44,  // H1
}

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 12,
  },
}

export const fontFamily = {
  // Inter — body text
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  // Plus Jakarta Sans — display/headings
  display: 'PlusJakartaSans_700Bold',
  displayBold: 'PlusJakartaSans_800ExtraBold',
  displaySemi: 'PlusJakartaSans_600SemiBold',
  // Space Grotesk — accents/labels
  accent: 'SpaceGrotesk_600SemiBold',
  accentBold: 'SpaceGrotesk_700Bold',
  accentMedium: 'SpaceGrotesk_500Medium',
}
