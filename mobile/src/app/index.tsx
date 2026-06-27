import { Redirect } from 'expo-router'

// Always redirect root to welcome screen
export default function Index() {
  return <Redirect href="/welcome" />
}
