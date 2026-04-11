import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

function decodeJWT(token: string): { sub: string; email?: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export default async function Home() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('supabase.auth.token')

  if (sessionCookie?.value) {
    try {
      const decoded = decodeURIComponent(sessionCookie.value)
      const session = JSON.parse(decoded)
      if (session.access_token) {
        const payload = decodeJWT(session.access_token)
        if (payload?.sub && payload.exp > Math.floor(Date.now() / 1000)) {
          redirect('/dashboard')
        }
      }
    } catch {}
  }
  redirect('/login')
}
