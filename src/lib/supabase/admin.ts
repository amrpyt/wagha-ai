import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPabase_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Direct GoTrue API call - bypasses auth-js Bearer null bug
async function gotrueFetch(endpoint: string, body: Record<string, unknown>, apiKey: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${endpoint}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'apikey': apiKey,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.msg || data.error || 'GoTrue API error')
  }
  return data
}

// Create user and return session directly via GoTrue API (bypasses auth-js)
export async function createUserWithSession(email: string, password: string, userMetadata?: Record<string, unknown>) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Step 1: Create user via admin API
  const userResponse = await gotrueFetch('/auth/v1/admin/users', {
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  }, serviceRoleKey)

  // Step 2: Create session via token endpoint with password grant
  const sessionResponse = await gotrueFetch('/auth/v1/token?grant_type=password', {
    email,
    password,
  }, serviceRoleKey)

  return {
    user: userResponse,
    session: sessionResponse,
  }
}

// Sign in with password via direct GoTrue API (bypasses auth-js)
export async function signInWithPassword(email: string, password: string) {
  // Use service role key for password grant to avoid anon key issues
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return gotrueFetch('/auth/v1/token?grant_type=password', {
    email,
    password,
  }, serviceRoleKey)
}
