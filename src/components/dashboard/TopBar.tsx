'use client'

import Link from 'next/link'

interface TopBarProps {
  userName: string
  firmName: string
}

export function TopBar({ userName, firmName }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 text-right">
          {firmName}
        </h1>
        <p className="text-sm text-gray-500 text-right">
          لوحة التحكم
        </p>
      </div>

      <Link href="/projects/new">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-colors cursor-pointer" style={{ backgroundColor: '#1E3A5F' }}>
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          مشروع جديد
        </button>
      </Link>
    </header>
  )
}
