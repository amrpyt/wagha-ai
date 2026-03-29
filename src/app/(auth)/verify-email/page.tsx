'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <AuthCard title="تم التحقق من البريد الإلكتروني">
      <div className="rtl:text-right rtl:space-y-4">
        <p className="text-gray-700">
          تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن استخدام حسابك.
        </p>
        <Link href="/dashboard">
          <button className="w-full rtl:mt-4 rtl:py-2.5 rtl:px-4 rtl:rounded-lg bg-[#1E3A5F] text-white font-medium hover:bg-[#162d4a] transition-colors cursor-pointer">
            الذهاب إلى لوحة التحكم
          </button>
        </Link>
      </div>
    </AuthCard>
  )
}
