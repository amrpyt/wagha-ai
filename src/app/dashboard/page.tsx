import { getProjects } from '@/lib/actions/projects'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import Link from 'next/link'

export default async function DashboardPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-gray-400 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          لا توجد مشاريع بعد
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          ارفع أول تصميم للحصول على صورة معمارية ثلاثية الأبعاد احترافية
        </p>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-colors cursor-pointer" style={{ backgroundColor: '#1E3A5F' }}
        >
          ابدأ بـ رفع تصميمك مجاناً
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          المشاريع الأخيرة
        </h2>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer border" style={{ borderColor: '#1E3A5F', color: '#1E3A5F' }}
        >
          مشروع جديد
        </Link>
      </div>
      <ProjectGrid projects={projects} />
    </div>
  )
}
