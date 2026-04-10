import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AppShellProps {
  children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
