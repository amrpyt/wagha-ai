'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GenerationProgressProps {
  projectId: string
  onCancel: () => void
}

interface ProgressData {
  progress?: number
  status?: string
  error?: string
  renderUrl?: string
}

export function GenerationProgress({ projectId, onCancel }: GenerationProgressProps) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('جاري البدء...')
  const [error, setError] = useState<string | null>(null)
  const [renderUrl, setRenderUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Connect to SSE endpoint
    eventSourceRef.current = new EventSource(`/api/generate?projectId=${projectId}`)

    eventSourceRef.current.onmessage = (event) => {
      const data: ProgressData = JSON.parse(event.data)

      if (data.error) {
        setError(data.error)
        setStatus('فشل التوليد')
        eventSourceRef.current?.close()
        return
      }

      if (data.progress !== undefined) {
        setProgress(data.progress)
      }
      if (data.status) {
        setStatus(data.status)
      }
      if (data.renderUrl) {
        setRenderUrl(data.renderUrl)
        eventSourceRef.current?.close()
        // Redirect to project page after short delay
        setTimeout(() => {
          router.push(`/dashboard/projects/${projectId}`)
        }, 1500)
      }
    }

    eventSourceRef.current.onerror = () => {
      setError('انقطع الاتصال — يرجى المحاولة مرة أخرى')
      eventSourceRef.current?.close()
    }

    return () => {
      eventSourceRef.current?.close()
    }
  }, [projectId, router])

  const handleCancel = () => {
    eventSourceRef.current?.close()
    onCancel()
  }

  const handleRetry = () => {
    router.push('/dashboard/projects/new')
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{status}</span>
          <span className="text-sm font-medium text-[#1E3A5F]">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#1E3A5F] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status messages during generation */}
      {!error && !renderUrl && (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">لا تغلق هذه الصفحة</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#152d4a] transition-colors"
                >
                  إعادة المحاولة
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {renderUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-800">اكتمل التوليد! جاري التحويل إلى صفحة المشروع...</p>
          </div>
        </div>
      )}

      {/* Cancel button (only while generating) */}
      {!error && !renderUrl && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  )
}
