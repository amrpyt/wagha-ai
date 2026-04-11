import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

// Decode JWT directly to get user ID without calling auth API (bypasses Bearer null issue)
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

// Check if session token is expired
function isTokenExpired(accessToken: string): boolean {
  const payload = decodeJWT(accessToken)
  if (!payload?.exp) return true // treat missing exp as expired
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Decode JWT from cookie directly to get user (bypasses getUser() API call which has Bearer null bug)
  const sessionCookie = request.cookies.get('supabase.auth.token')
  let user: { id: string; email?: string } | null = null

  if (sessionCookie?.value) {
    try {
      // Cookie may be URL-encoded in some browsers — try decode first, fall back to raw
      let cookieValue = sessionCookie.value
      try {
        const decoded = decodeURIComponent(sessionCookie.value)
        // Only use decoded if it looks like valid JSON starts with '{'
        if (decoded.startsWith('{')) {
          cookieValue = decoded
        }
      } catch {
        // decodeURIComponent failed — use raw value
      }
      const session = JSON.parse(cookieValue)
      if (session.access_token && !isTokenExpired(session.access_token)) {
        const payload = decodeJWT(session.access_token)
        if (payload?.sub) {
          user = { id: payload.sub, email: payload.email }
        }
      }
    } catch {
      // Invalid session cookie
    }
  }

  // Protect dashboard routes
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isSettings = request.nextUrl.pathname.startsWith('/settings')
  const isProjects = request.nextUrl.pathname.startsWith('/projects')
  const isApps = request.nextUrl.pathname.startsWith('/apps')

  if (!user && (isDashboard || isSettings || isProjects || isApps)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set('Cache-Control', 'private, no-store')

  return supabaseResponse
}
