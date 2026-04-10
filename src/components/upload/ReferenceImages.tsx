'use client'

import { useState, useCallback } from 'react'

interface ReferenceImagesProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function ReferenceImages({ files, onChange }: ReferenceImagesProps) {
  const [error, setError] = useState<string | null>(null)

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = Array.from(e.target.files || [])
    if (files.length + selected.length > 4) {
      setError('الحد الأقصى 4 صور مرجعية')
      return
    }
    const valid = selected.filter(f => f.type.startsWith('image/'))
    if (valid.length !== selected.length) {
      setError('فقط ملفات الصور مسموحة')
      return
    }
    onChange([...files, ...valid])
    e.target.value = ''
  }, [files, onChange])

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 text-right mb-2">
        📎 صورة مرجعية
        <span className="text-gray-400 font-normal mr-2">(اختياري — حتى 4 صور)</span>
      </label>

      <div className="flex gap-3 flex-wrap">
        {/* Thumbnail previews */}
        {files.map((file, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt={`مرجعي ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add button */}
        {files.length < 4 && (
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#1E3A5F] flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:text-[#1E3A5F] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs">{files.length}/4</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-right">{error}</p>
      )}
    </div>
  )
}
