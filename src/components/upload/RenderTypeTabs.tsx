'use client'

import type { RenderType } from '@/lib/ai/prompts'

interface RenderTypeTabsProps {
  value: RenderType
  onChange: (type: RenderType) => void
}

export function RenderTypeTabs({ value, onChange }: RenderTypeTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        type="button"
        onClick={() => onChange('exterior')}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
          ${value === 'exterior'
            ? 'bg-[#1E3A5F] text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        خارجي AI
      </button>
      <button
        type="button"
        onClick={() => onChange('interior')}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
          ${value === 'interior'
            ? 'bg-[#1E3A5F] text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        داخلي AI
      </button>
    </div>
  )
}
