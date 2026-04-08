'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { ProjectForm } from '@/components/upload/ProjectForm'
import { GenerationProgress } from '@/components/upload/GenerationProgress'
import { uploadAndGenerate } from '@/lib/actions/upload'

type UploadStage = 'select' | 'form' | 'generating'

export default function NewProjectPage() {
  const [stage, setStage] = useState<UploadStage>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setError(null)
    setStage('form')
  }

  const handleUploadStart = (id: string) => {
    setProjectId(id)
    setStage('generating')
  }

  const handleUploadError = (err: string) => {
    setError(err)
  }

  const handleBack = () => {
    setSelectedFile(null)
    setStage('select')
    setError(null)
  }

  const handleCancel = () => {
    setProjectId(null)
    setStage('form')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A5F]">
          لوحة التحكم
        </Link>
        <span>/</span>
        <span className="text-gray-900">مشروع جديد</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right mb-6">
          إنشاء مشروع جديد
        </h1>

        {stage === 'select' && (
          <div className="space-y-6">
            <p className="text-gray-600 text-right">
              ارفع ملفاً ثم أدخل اسم المشروع لبدء التوليد
            </p>
            <DropZone
              onFileSelected={handleFileSelected}
              isProcessing={false}
            />
          </div>
        )}

        {stage === 'form' && selectedFile && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 text-right">{error}</p>
              </div>
            )}
            <ProjectForm
              file={selectedFile}
              uploadAction={uploadAndGenerate}
              onUploadStart={handleUploadStart}
              onError={handleUploadError}
            />
            <button
              onClick={handleBack}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              العودة
            </button>
          </div>
        )}

        {stage === 'generating' && projectId && (
          <div className="space-y-6">
            <GenerationProgress
              projectId={projectId}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
