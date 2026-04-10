import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FirmSettingsForm } from '@/components/settings/FirmSettingsForm'
import type { Database } from '@/types/database.types'

type FirmMemberRow = Database['public']['Tables']['firm_members']['Row']

export default async function FirmSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember || firmMember.role !== 'admin') {
    redirect('/settings')
  }

  const { data: firm } = await supabase
    .from('firms')
    .select('name, logo_url, brand_color')
    .eq('id', firmMember.firm_id)
    .single() as { data: Database['public']['Tables']['firms']['Row'] | null }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right">
          إعدادات الشركة
        </h1>
        <p className="text-gray-500 text-right mt-1">
          إدارة معلومات الشركة والشعار
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {firm && (
          <FirmSettingsForm
            firm={{
              name: firm.name,
              logo_url: firm.logo_url,
              brand_color: firm.brand_color || '#1E3A5F',
            }}
          />
        )}
      </div>
    </div>
  )
}
