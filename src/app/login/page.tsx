'use client'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-right mb-6" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
          تسجيل الدخول
        </h1>
        <p className="text-center text-gray-600">
          صفحة تسجيل الدخول - سيتم تنفيذها في الخطة التالية
        </p>
        <div className="mt-6">
          <button className="w-full py-3 px-4 bg-[#1E3A5F] text-white rounded-lg font-medium">
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  )
}
