/**
 * Unified JWT utilities for cookie-based auth.
 * Decodes JWT directly from Supabase session cookie — bypasses auth-js getUser()
 * which has a known Bearer null bug.
 */
function decodeJWT(token: string): { sub: string; email?: string; aud: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Handle base64url encoding (ES256 JWTs use this)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(accessToken: string): boolean {
  const payload = decodeJWT(accessToken)
  if (!payload?.exp) return true // treat missing exp as expired
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

export interface AuthUser {
  id: string
  email?: string
}

/**
 * Get authenticated user from supabase.auth.token cookie without calling the auth API.
 * Bypasses the Bearer null bug in auth-js getUser().
 */
export async function getUserFromCookie(): Promise<AuthUser | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('supabase.auth.token')
  if (!sessionCookie?.value) return null

  try {
    // Cookie may be URL-encoded in some browsers — try decode first, fall back to raw
    let cookieValue = sessionCookie.value
    if (!cookieValue.startsWith('{')) {
      try {
        const decoded = decodeURIComponent(sessionCookie.value)
        if (decoded.startsWith('{')) cookieValue = decoded
      } catch {
        // decodeURIComponent failed — use raw value
      }
    }
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

export { decodeJWT, isTokenExpired }