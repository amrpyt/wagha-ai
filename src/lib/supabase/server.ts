import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { decodeJWT, isTokenExpired } from '@/lib/auth/jwt'

// Re-export for middleware and other consumers
export { decodeJWT, isTokenExpired } from '@/lib/auth/jwt'

// Get authenticated user from cookie without calling getUser() API (bypasses Bearer null bug)
export async function getUserFromCookie() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('supabase.auth.token')
  if (!sessionCookie?.value) return null

  try {
    const cookieValue = sessionCookie.value.startsWith('{')
      ? sessionCookie.value
      : decodeURIComponent(sessionCookie.value)
    const session = JSON.parse(cookieValue)
    if (!session?.access_token) return null
    if (isTokenExpired(session.access_token)) return null

    const payload = decodeJWT(session.access_token)
    if (!payload?.sub) return null

    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}

// Set session cookies directly from access/refresh tokens (bypasses auth-js setSession)
export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // Auth-js stores the session as JSON under the key 'supabase.auth.token'
  const sessionData = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: 'bearer',
    user: null,
  }

  const cookiesToSet = [
    {
      name: 'supabase.auth.token',
      value: JSON.stringify(sessionData), // Pass raw JSON - cookieStore handles encoding
      options: {
        path: '/',
        httpOnly: true,
        secure: supabaseUrl.startsWith('https://'),
        sameSite: 'lax' as const,
        maxAge: 604800,
      },
    },
  ]

  cookiesToSet.forEach(({ name, value, options }) => {
    try {
      cookieStore.set(name, value, options)
    } catch (err) {
      console.error(`Failed to set cookie ${name}:`, err)
    }
  })
}
