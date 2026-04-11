'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthForm } from '@/components/auth/AuthForm'
import { signIn } from '../actions'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <AuthCard title="تسجيل الدخول">
      <AuthForm
        action={signIn}
        noRedirect={true}
        fields={[
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
          { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
        ]}
        submitLabel="تسجيل الدخول"
      >
        <div className="rtl:mt-4 rtl:text-right">
          <Link
            href="/reset-password"
            className="text-sm text-[#1E3A5F] hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="rtl:mt-4 rtl:pt-4 rtl:border-t rtl:border-gray-200 rtl:text-right">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="text-[#1E3A5F] hover:underline font-medium">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </AuthForm>
    </AuthCard>
  )
}
