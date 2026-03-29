import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTeamMembers, getInvitations } from '@/lib/actions/settings'
import { TeamInviteForm } from '@/components/settings/TeamInviteForm'
import { TeamMemberList } from '@/components/settings/TeamMemberList'

export default async function TeamSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!firmMember || firmMember.role !== 'admin') {
    redirect('/settings')
  }

  const members = await getTeamMembers()
  const invitations = await getInvitations()

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right">
          إدارة الفريق
        </h1>
        <p className="text-gray-500 text-right mt-1">
          دعوة أعضاء جدد للانضمام إلى شركتك
        </p>
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-right mb-4">
          دعوة عضو جديد
        </h2>
        <TeamInviteForm />
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 mb-6">
          <h3 className="font-medium text-yellow-800 text-right mb-2">
            دعوات معلقة
          </h3>
          <ul className="space-y-2">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex justify-between text-sm text-yellow-700">
                <span>{inv.email}</span>
                <span>{inv.role === 'admin' ? 'مشرف' : 'عضو'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Members */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-right mb-4">
          أعضاء الفريق الحاليون
        </h2>
        <TeamMemberList members={members} />
      </div>
    </div>
  )
}
