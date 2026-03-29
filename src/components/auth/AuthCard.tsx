'use client'

import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  title: string
}

export function AuthCard({ children, title }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] rtl:px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 rtl:p-8">
        <h1 className="text-2xl font-semibold text-right rtl:mb-6 text-gray-900">{title}</h1>
        {children}
      </div>
    </div>
  )
}
