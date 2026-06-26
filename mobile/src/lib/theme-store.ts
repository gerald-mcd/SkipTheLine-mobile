import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'stl:dark-mode'

interface ThemeStore {
  isDark: boolean
  hydrated: boolean
  toggle: () => void
  hydrate: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: false,
  hydrated: false,
  toggle: () => {
    const next = !get().isDark
    set({ isDark: next })
    AsyncStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  },
  hydrate: async () => {
    const v = await AsyncStorage.getItem(STORAGE_KEY)
    set({ isDark: v === '1', hydrated: true })
  },
}))

export const LIGHT = {
  background: '#FAFAF8',
  foreground: '#33384A',
  mutedForeground: '#857565',
  card: '#FFFFFF',
  border: '#EDE6DD',
  primary: '#F8682B',
  primaryForeground: '#FFFCF7',
  success: '#5DB18A',
  destructive: '#D9462E',
} as const

export const DARK = {
  background: '#12141A',
  foreground: '#F0EDE8',
  mutedForeground: '#9A9284',
  card: '#1C1F28',
  border: '#2A2D38',
  primary: '#F8682B',
  primaryForeground: '#FFFCF7',
  success: '#5DB18A',
  destructive: '#D9462E',
} as const

export interface ThemeColors {
  background: string
  foreground: string
  mutedForeground: string
  card: string
  border: string
  primary: string
  primaryForeground: string
  success: string
  destructive: string
}

export function useColors(): ThemeColors {
  const isDark = useThemeStore(s => s.isDark)
  return isDark ? DARK : LIGHT
}
