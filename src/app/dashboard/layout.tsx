import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

// Decode JWT directly to get user without calling auth API (bypasses Bearer null bug)
function decodeJWT(token: string): { sub: string; email?: string; aud: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

function isTokenExpired(accessToken: string): boolean {
  const payload = decodeJWT(accessToken)
  if (!payload?.exp) return true
  return payload.exp < Math.floor(Date.now() / 1000)
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session from cookie directly (bypasses auth-js getUser which has Bearer null bug)
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('supabase.auth.token')

  let user: { id: string; email?: string } | null = null

  if (sessionCookie?.value) {
    try {
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

  if (!user) {
    redirect('/login')
  }

  // Get firm info via admin client (bypasses potential RLS issues)
  const supabase = await createClient()
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role, firms(name, brand_color)')
    .eq('user_id', user.id)
    .single() as { data: { firm_id: string; role: string; firms: { name?: string; brand_color?: string } | null } | null }

  const firm = firmMember?.firms as { name?: string; brand_color?: string } | undefined

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar
        firmName={firm?.name || 'شركتي'}
        brandColor={firm?.brand_color || '#1E3A5F'}
        userName={user.email || ''}
      />
      <div className="mr-64 min-h-screen">
        <TopBar
          userName={user.email || ''}
          firmName={firm?.name || 'شركتي'}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
