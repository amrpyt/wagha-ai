'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthForm } from '@/components/auth/AuthForm'
import { signUp } from '../actions'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <AuthCard title="إنشاء حساب جديد">
      <AuthForm
        action={signUp}
        fields={[
          { name: 'firmName', label: 'اسم الشركة المعمارية', required: true, placeholder: 'مثال: مكتب العمارة الحديث' },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
          { name: 'password', label: 'كلمة المرور', type: 'password', required: true, placeholder: '8 أحرف على الأقل' },
        ]}
        submitLabel="ابدأ مجاناً"
        initialState={{}}
      >
        <div className="rtl:mt-4 rtl:pt-4 rtl:border-t rtl:border-gray-200 rtl:text-right">
          <p className="text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-[#1E3A5F] hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </AuthForm>
    </AuthCard>
  )
}
