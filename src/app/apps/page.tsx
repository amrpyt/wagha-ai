import Link from 'next/link'

const APPS = [
  {
    id: '2d-to-3d',
    name: '2D إلى 3D',
    description: 'ارفع تصميمك ثنائي الأبعاد واحصل على نموذج ثلاثي الأبعاد واقعي',
    icon: '🏠',
    href: '/apps/2d-to-3d',
    color: '#1E3A5F',
  },
  {
    id: 'interior',
    name: 'تصميم داخلي',
    description: 'قم بتصميم الفراغات الداخلية بدقة عالية',
    icon: '🛋️',
    href: '/apps/interior',
    color: '#2D6A4F',
  },
  {
    id: 'suggestions',
    name: 'اقتراحات ذكية',
    description: 'احصل على dozens من الاقتراحات لتصميمك',
    icon: '✨',
    href: '/apps/suggestions',
    color: '#7B2D8E',
  },
]

export default function AppsHubPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl font-semibold text-gray-900">التطبيقات</h1>
        <p className="text-gray-500 mt-1">اختر التطبيق المناسب لتصميمك</p>
      </div>

      {/* App Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APPS.map((app) => (
          <Link
            key={app.id}
            href={app.href}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all cursor-pointer text-right"
          >
            {/* Color bar */}
            <div
              className="h-2"
              style={{ backgroundColor: app.color }}
            />

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <span className="text-4xl">{app.icon}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 group-hover:text-gray-600 transition-colors mt-1"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mt-4">{app.name}</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{app.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
