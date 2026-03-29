import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get firm info
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role, firms(name, brand_color)')
    .eq('user_id', user.id)
    .single()

  const firm = firmMember?.firms as { name?: string; brand_color?: string } | undefined

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* RTL Sidebar - right side in RTL */}
      <Sidebar
        firmName={firm?.name || 'شركتي'}
        brandColor={firm?.brand_color || '#1E3A5F'}
        userName={user.email || ''}
      />

      {/* Main content area with top bar */}
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
