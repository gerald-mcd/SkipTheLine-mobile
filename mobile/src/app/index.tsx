import { Redirect } from 'expo-router'

// Bypass welcome — go straight to app (dev mode)
export default function Index() {
  return <Redirect href="/(tabs)" />
}
