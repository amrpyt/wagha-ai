'use client'

import { signOut } from '@/app/(auth)/actions'

export function LogoutButton() {
  async function handleLogout() {
    await signOut()
    // signOut action already handles redirect to /login
  }

  return (
    <button
      onClick={handleLogout}
      className="rtl:w-full rtl:justify-start rtl:gap-2 rtl:py-2 rtl:px-3 rtl:rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 w-full justify-start gap-2 py-2 px-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      تسجيل الخروج
    </button>
  )
}
