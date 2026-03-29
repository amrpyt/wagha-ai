'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthForm } from '@/components/auth/AuthForm'
import { resetPassword } from '../actions'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <AuthCard title="استعادة كلمة المرور">
      <AuthForm
        action={resetPassword}
        fields={[
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
        ]}
        submitLabel="إرسال رابط الاستعادة"
        initialState={{}}
      >
        <div className="rtl:mt-4 rtl:text-right">
          <Link href="/login" className="text-sm text-[#1E3A5F] hover:underline">
            تذكرت كلمة المرور؟ تسجيل الدخول
          </Link>
        </div>
      </AuthForm>
    </AuthCard>
  )
}
