import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string          // Supabase auth UUID
  email: string
  name: string
  handle: string
  points: number
  trust_score: number
  is_test_user: boolean
}

// ─── Sign up with email ───────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('No user returned from signup')

  // Create user profile row
  await createUserProfile(data.user.id, email, name)
  return data.user
}

// ─── Sign in with email ───────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

// ─── Sign in as test user (bypass for dev/demo) ───────────────────────────────

export async function signInAsTestUser() {
  const TEST_EMAIL    = 'test@skiptheline.site'
  const TEST_PASSWORD = 'SkipTest2024!'

  // Try signing in first
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (error) {
    // Account doesn't exist yet — create it
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    if (signUpError) throw signUpError
    if (!signUpData.user) throw new Error('Failed to create test user')

    await createUserProfile(signUpData.user.id, TEST_EMAIL, 'Test User', true)
    return signUpData.user
  }

  return data.user
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Get current session ──────────────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── Get current user profile from DB ────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, handle, points, trust_score, is_test_user')
    .eq('auth_id', user.id)
    .single()

  if (error || !data) return null
  return data as AuthUser
}

// ─── Create user profile row on first login ───────────────────────────────────

async function createUserProfile(
  authId: string,
  email: string,
  name: string,
  isTestUser = false
) {
  const handle = generateHandle(name)

  const { error } = await supabase.from('users').upsert({
    auth_id:          authId,
    email,
    name,
    handle,
    is_test_user:     isTestUser,
    first_login_at:   new Date().toISOString(),
    terms_accepted_at: new Date().toISOString(),
    terms_version:    '1.0',
  }, { onConflict: 'auth_id' })

  if (error) console.error('Error creating user profile:', error)
}

// ─── Generate a unique handle from name ──────────────────────────────────────

function generateHandle(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `@${base}${suffix}`
}
