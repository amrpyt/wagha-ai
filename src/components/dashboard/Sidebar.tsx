'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface SidebarProps {
  firmName: string
  brandColor: string
  userName: string
}

// Fast design shortcuts — link to new project page with pre-filled options
const FAST_DESIGNS = [
  {
    label: 'خارجي - حديث',
    href: '/dashboard/projects/new?type=exterior&template=modern',
    icon: '🏠',
  },
  {
    label: 'خارجي - كلاسيكي',
    href: '/dashboard/projects/new?type=exterior&template=classic',
    icon: '🏛️',
  },
  {
    label: 'خارجي - مينيمال',
    href: '/dashboard/projects/new?type=exterior&template=minimal',
    icon: '⬜',
  },
  {
    label: 'خارجي - فيلا',
    href: '/dashboard/projects/new?type=exterior&template=villa',
    icon: '🏡',
  },
  {
    label: 'خارجي - تجاري',
    href: '/dashboard/projects/new?type=exterior&template=commercial',
    icon: '🏢',
  },
  {
    label: 'داخلي - سكني',
    href: '/dashboard/projects/new?type=interior&template=residential',
    icon: '🏠',
  },
  {
    label: 'داخلي - مكتبي',
    href: '/dashboard/projects/new?type=interior&template=office',
    icon: '💼',
  },
]

export function Sidebar({ firmName, brandColor, userName }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'لوحة التحكم',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: '/dashboard/projects',
      label: 'المشاريع',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ]

  const settingsItems = [
    {
      href: '/settings',
      label: 'الإعدادات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ]

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-gray-200 flex flex-col"
    >
      {/* Firm Header */}
      <div
        className="p-4 border-b border-gray-200"
        style={{ backgroundColor: brandColor }}
      >
        <h2 className="text-white font-semibold text-lg text-right">
          {firmName}
        </h2>
        <p className="text-white/80 text-sm text-right mt-1">
          {userName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main nav */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                isActive(item.href)
                  ? 'bg-opacity-10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive(item.href) ? { backgroundColor: brandColor + '1a', color: brandColor } : {}}
            >
              {item.icon}
              <span className="text-right">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Fast Designs shortcut */}
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
          <p className="text-xs text-gray-400 px-3 pb-2 text-right">
            التصاميم السريعة
          </p>
          {FAST_DESIGNS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                pathname === item.href
                  ? ''
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-sm text-right">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
          <p className="text-xs text-gray-400 px-3 pb-2 text-right">
            الإعدادات
          </p>
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                isActive(item.href)
                  ? 'bg-opacity-10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive(item.href) ? { backgroundColor: brandColor + '1a', color: brandColor } : {}}
            >
              {item.icon}
              <span className="text-right">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </aside>
  )
}
