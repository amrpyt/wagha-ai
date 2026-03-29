import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountSettingsForm } from '@/components/settings/AccountSettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right">
          إعدادات الحساب
        </h1>
        <p className="text-gray-500 text-right mt-1">
          إدارة معلومات حسابك
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AccountSettingsForm
          currentName={(user.user_metadata as Record<string, unknown>)?.full_name as string || ''}
          currentEmail={user.email || ''}
        />
      </div>
    </div>
  )
}
