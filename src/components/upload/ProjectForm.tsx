'use client'

import { useState, useTransition } from 'react'
import type { UploadState } from '@/types/upload'

interface ProjectFormProps {
  file: File
  uploadAction: (prevState: UploadState, formData: FormData) => Promise<UploadState>
  onUploadStart: (projectId: string) => void
  onError: (error: string) => void
}

export function ProjectForm({ file, uploadAction, onUploadStart, onError }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const [projectName, setProjectName] = useState('')
  const [projectNumber, setProjectNumber] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!projectName.trim()) {
      onError('اسم المشروع مطلوب')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectName', projectName.trim())
    formData.append('projectNumber', projectNumber.trim())

    startTransition(async () => {
      const result = await uploadAction({ success: false }, formData)
      if (result.error) {
        onError(result.error)
      } else if (result.success && result.projectId) {
        onUploadStart(result.projectId)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <svg className="w-8 h-8 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="flex-1 text-right">
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>

      {/* Project name */}
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 text-right mb-1">
          اسم المشروع <span className="text-red-500">*</span>
        </label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="مشروع Villa 2024"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent text-right text-gray-900"
          dir="rtl"
          required
        />
      </div>

      {/* Project number */}
      <div>
        <label htmlFor="projectNumber" className="block text-sm font-medium text-gray-700 text-right mb-1">
          رقم المشروع
        </label>
        <input
          id="projectNumber"
          type="text"
          value={projectNumber}
          onChange={(e) => setProjectNumber(e.target.value)}
          placeholder="2024-001"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent text-right text-gray-900"
          dir="rtl"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'جاري الرفع...' : 'إنشاء وبث التوليد'}
      </button>
    </form>
  )
}
