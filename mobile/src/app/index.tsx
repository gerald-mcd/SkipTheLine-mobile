import { Redirect } from 'expo-router'

// Demo mode active — go straight to app, no auth needed
// DEMO_MODE flag in src/lib/demo.ts controls mock data overlay
export default function Index() {
  return <Redirect href="/(tabs)" />
}
