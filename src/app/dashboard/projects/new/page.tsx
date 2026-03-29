import Link from 'next/link'

export default async function NewProjectPage() {
  // For Phase 1, show a simplified placeholder
  // The actual file upload happens in Phase 2
  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A5F]">
          لوحة التحكم
        </Link>
        <span>/</span>
        <span className="text-gray-900">مشروع جديد</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right mb-6">
          إنشاء مشروع جديد
        </h1>

        <div className="space-y-4 text-right">
          <p className="text-gray-600">
            سيتم إضافة وظيفة رفع الملفات في المرحلة التالية.
          </p>

          <div className="pt-4 border-t border-gray-200">
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                العودة إلى لوحة التحكم
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
