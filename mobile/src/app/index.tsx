import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { signInAsTestUser } from '@/lib/auth'

// Dev mode — auto sign in as test user and go straight to app
export default function Index() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    signInAsTestUser()
      .catch(() => {}) // ignore if already signed in
      .finally(() => setReady(true))
  }, [])

  if (!ready) return null
  return <Redirect href="/(tabs)" />
}
