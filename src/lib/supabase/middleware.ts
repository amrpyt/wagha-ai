import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { decodeJWT, isTokenExpired } from '@/lib/auth/jwt'

// Re-export for other consumers
export { decodeJWT, isTokenExpired } from '@/lib/auth/jwt'

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
