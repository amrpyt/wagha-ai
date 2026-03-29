'use client'

import { useState, useTransition } from 'react'
import { updateAccount, changePassword } from '@/lib/actions/settings'

type SettingsState = { success?: boolean; error?: string; needsVerification?: boolean }

export function AccountSettingsForm({
  currentName,
  currentEmail,
}: {
  currentName: string
  currentEmail: string
}) {
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [accountState, setAccountState] = useState<SettingsState | undefined>()
  const [pwdState, setPwdState] = useState<SettingsState | undefined>()
  const [isPending, startAccountTransition] = useTransition()
  const [isPwdPending, startPwdTransition] = useTransition()

  function handleAccountSubmit(formData: FormData) {
    startAccountTransition(async () => {
      const result = await updateAccount(accountState, formData)
      setAccountState(result)
    })
  }

  function handlePasswordSubmit(formData: FormData) {
    startPwdTransition(async () => {
      const result = await changePassword(pwdState, formData)
      setPwdState(result)
    })
  }

  return (
    <div className="space-y-6">
      {/* Name and Email */}
      <form action={handleAccountSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-2">
            الاسم
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={currentName}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right mb-2">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={currentEmail}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
          />
        </div>

        {accountState?.error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg">
            <p className="text-sm text-red-700 text-right">{accountState.error}</p>
          </div>
        )}

        {accountState?.success && !accountState.needsVerification && (
          <div className="bg-green-50 border-r-4 border-green-500 p-3 rounded-lg">
            <p className="text-sm text-green-700 text-right">تم تحديث الحساب بنجاح</p>
          </div>
        )}

        {accountState?.needsVerification && (
          <div className="bg-green-50 border-r-4 border-green-500 p-3 rounded-lg">
            <p className="text-sm text-green-700 text-right">تم إرسال رابط التحقق إلى بريدك الإلكتروني</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 cursor-pointer transition-colors"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>

      {/* Password Change */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="text-[#1E3A5F] hover:underline text-right w-full"
        >
          {showPasswordChange ? 'إلغاء تغيير كلمة المرور' : 'تغيير كلمة المرور'}
        </button>

        {showPasswordChange && (
          <form action={handlePasswordSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 text-right mb-2">
                كلمة المرور الحالية
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 text-right mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
              />
            </div>

            {pwdState?.error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg">
                <p className="text-sm text-red-700 text-right">{pwdState.error}</p>
              </div>
            )}

            {pwdState?.success && (
              <div className="bg-green-50 border-r-4 border-green-500 p-3 rounded-lg">
                <p className="text-sm text-green-700 text-right">تم تغيير كلمة المرور بنجاح</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPwdPending}
                className="px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 cursor-pointer transition-colors"
                style={{ backgroundColor: '#1E3A5F' }}
              >
                {isPwdPending ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
