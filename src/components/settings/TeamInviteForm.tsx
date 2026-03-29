'use client'

import { useState, useTransition } from 'react'
import { inviteTeamMember } from '@/lib/actions/settings'

type SettingsState = { success?: boolean; error?: string }

export function TeamInviteForm() {
  const [state, setState] = useState<SettingsState | undefined>()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await inviteTeamMember(state, formData)
      setState(result)
    })
  }

  return (
    <form action={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right mb-2">
          بريد الفريق
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@company.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent disabled:opacity-50"
          dir="ltr"
        />
      </div>

      <div className="w-32">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 text-right mb-2">
          الدور
        </label>
        <select
          id="role"
          name="role"
          defaultValue="member"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-right bg-white"
          disabled={isPending}
        >
          <option value="member">عضو</option>
          <option value="admin">مشرف</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 cursor-pointer transition-colors"
        style={{ backgroundColor: '#1E3A5F' }}
      >
        {isPending ? 'جاري الإرسال...' : 'إرسال دعوة'}
      </button>

      {state?.error && (
        <p className="text-sm text-red-600 mr-2 self-center">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600 mr-2 self-center">تم إرسال الدعوة بنجاح</p>
      )}
    </form>
  )
}
