'use client'

import { useState, useTransition } from 'react'
import { cancelSubscription } from '@/lib/actions/billing'

export function CancelSubscriptionForm() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelSubscription()
      setResult(res)
    })
  }

  return (
    <div className="flex justify-between items-start">
      <div className="text-right">
        <p className="font-medium text-gray-900">إلغاء الاشتراك</p>
        <p className="text-sm text-gray-500">ستفقد الوصول عند انتهاء فترة الفوترة</p>
      </div>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'جاري الإلغاء...' : 'إلغاء الاشتراك'}
      </button>
      {result?.error && (
        <p className="text-sm text-red-600 mr-2 self-center">{result.error}</p>
      )}
    </div>
  )
}
