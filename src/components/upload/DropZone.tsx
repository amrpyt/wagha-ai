'use client'

import { useDropzone } from 'react-dropzone'
import { useState, useCallback } from 'react'
import type { UploadState } from '@/lib/actions/upload'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  isProcessing: boolean
}

export function DropZone({ onFileSelected, isProcessing }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: Array<{ file: File; errors: Array<{ code: string; message: string }> }>) => {
    setError(null)
    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles.flatMap(r => r.errors.map(e => e.message))
      setError(reasons.join(' — '))
      return
    }
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0])
    }
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isProcessing,
    onDrop,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-gray-300 hover:border-[#1E3A5F]'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {/* Upload icon */}
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          {isDragActive ? (
            <p className="text-[#1E3A5F] font-medium">أفلت الملف هنا</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                اسحب ملفاً هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500">
                JPG أو PNG أو PDF — حجم أقصى 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-right">{error}</p>
      )}
    </div>
  )
}
