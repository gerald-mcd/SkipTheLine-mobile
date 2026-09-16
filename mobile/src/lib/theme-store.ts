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
  background: '#11141c',
  foreground: '#f3f1ec',
  mutedForeground: '#8b93a6',
  card: '#181c27',
  border: 'rgba(243,241,236,0.12)',
  primary: '#ff8a3d',
  primaryForeground: '#11141c',
  success: '#35d07f',
  destructive: '#D9462E',
} as const

export const DARK = {
  background: '#11141c',
  foreground: '#f3f1ec',
  mutedForeground: '#8b93a6',
  card: '#181c27',
  border: 'rgba(243,241,236,0.12)',
  primary: '#ff8a3d',
  primaryForeground: '#11141c',
  success: '#35d07f',
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
