'use client'

import { useState, useTransition } from 'react'

interface PricingCardProps {
  planId: string
  nameAr: string
  nameEn: string
  price: number
  credits: number
  description: string
  isPopular?: boolean
  currentPlan?: boolean
  onSubscribe: (planId: string) => Promise<{ success: boolean; checkoutUrl?: string; error?: string }>
}

export function PricingCard({
  planId,
  nameAr,
  nameEn,
  price,
  credits,
  description,
  isPopular,
  currentPlan,
  onSubscribe,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await onSubscribe(planId)
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.error) {
        setError(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`relative rounded-lg border p-6 bg-white text-right ${
        isPopular
          ? 'border-2 border-[#1E3A5F] shadow-lg'
          : 'border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 right-4 bg-[#1E3A5F] text-white px-3 py-1 rounded-full text-xs font-medium">
          الأكثر شعبية
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{nameAr}</h3>
        <p className="text-sm text-gray-500">{nameEn}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-500 mr-1">EGP</span>
        <span className="text-sm text-gray-400 block">/ شهرياً</span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <p className="font-medium text-[#1E3A5F]">{credits} تصاميم</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700">تصميم واحد مجاني</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700">بدون رسوم إضافية</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-700">PDF احترافي بالعربية</span>
        </li>
      </ul>

      {currentPlan ? (
        <button
          disabled
          className="w-full py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
        >
          الخطة الحالية
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 cursor-pointer ${
            isPopular ? '' : 'bg-gray-500 hover:bg-gray-600'
          }`}
          style={isPopular ? { backgroundColor: '#1E3A5F' } : {}}
        >
          {isLoading ? 'جاري التحويل...' : 'اشترك الآن'}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
