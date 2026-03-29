'use client'

import { useState, useTransition } from 'react'
import type { ReactNode } from 'react'

interface FormField {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}

type AuthState = { error?: string; success?: boolean; needsVerification?: boolean }

interface AuthFormProps {
  action: (prevState: AuthState | undefined, formData: FormData) => Promise<AuthState>
  fields: FormField[]
  submitLabel: string
  children?: ReactNode
  initialState?: AuthState
}

export function AuthForm({ action, fields, submitLabel, children, initialState }: AuthFormProps) {
  const [state, setState] = useState<AuthState | undefined>(initialState)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData)
      setState(result)
    })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4 rtl:mt-6">
      {fields.map((field) => (
        <div key={field.name} className="rtl:space-y-2">
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-right rtl:text-right text-gray-700"
          >
            {field.label}
            {field.required && <span className="rtl:mr-1 text-red-500">*</span>}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPending}
            className="w-full rtl:text-right rtl:px-4 rtl:py-2.5 rtl:rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          />
        </div>
      ))}

      {state?.error && (
        <div className="bg-red-50 rtl:border-r-4 rtl:border-red-500 rtl:p-3 rtl:rounded-lg">
          <p className="text-sm text-red-700 text-right">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 rtl:border-r-4 rtl:border-green-500 rtl:p-3 rtl:rounded-lg">
          <p className="text-sm text-green-700 text-right">
            {state.needsVerification
              ? 'تم إرسال رابط التحقق إلى بريدك الإلكتروني'
              : 'تم بنجاح'}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rtl:mt-4 rtl:py-2.5 rtl:px-4 rtl:rounded-lg bg-[#1E3A5F] text-white font-medium hover:bg-[#162d4a] disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer"
      >
        {isPending ? 'جاري التحميل...' : submitLabel}
      </button>

      {children}
    </form>
  )
}
