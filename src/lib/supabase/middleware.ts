import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

// Decode JWT directly to get user ID without calling auth API (bypasses Bearer null issue)
function decodeJWT(token: string): { sub: string; email?: string; aud: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
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
      // Cookie value may be URL-encoded, so decode it before parsing
      const decodedValue = decodeURIComponent(sessionCookie.value)
      const session = JSON.parse(decodedValue)
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
