'use client'

import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DropZone } from '@/components/upload/DropZone'
import { PromptInput } from '@/components/upload/PromptInput'
import { ReferenceImages } from '@/components/upload/ReferenceImages'
import { SavePresetModal } from '@/components/modals/SavePresetModal'
import { GenerationProgress } from '@/components/upload/GenerationProgress'
import { LeftPanel } from '@/components/upload/LeftPanel'
import { RenderTypeTabs } from '@/components/upload/RenderTypeTabs'
import { TemplatePills } from '@/components/upload/TemplatePills'
import type { RenderType, RenderModifiers, ExteriorTemplate, InteriorTemplate } from '@/lib/ai/prompts'

type GenerationStage = 'idle' | 'uploading' | 'generating' | 'complete' | 'error'

// Default exterior-modern modifiers
const DEFAULT_MODIFIERS: RenderModifiers = {
  cameraAngle: 'eyeLevel',
  greenery: 'some',
  vehicles: 'none',
  people: 'none',
  streetProps: 'none',
  timeOfDay: 'goldenHour',
  weather: 'clear',
  mood: 'neutral',
  ground: 'concrete',
  annotations: false,
}

export default function NewProjectPage() {
  const router = useRouter()

  // ── Render configuration state ──────────────────────────────
  const [renderType, setRenderType] = useState<RenderType>('exterior')
  const [template, setTemplate] = useState<ExteriorTemplate>('modern')
  const [modifiers, setModifiers] = useState<RenderModifiers>(DEFAULT_MODIFIERS)
  const [customPrompt, setCustomPrompt] = useState('')

  // ── File state ─────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])

  // ── Generation state ───────────────────────────────────────
  const [stage, setStage] = useState<GenerationStage>('idle')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSavePreset, setShowSavePreset] = useState(false)

  // ── Handlers ────────────────────────────────────────────────

  const handleTemplateChange = (t: ExteriorTemplate | InteriorTemplate) => {
    setTemplate(t as ExteriorTemplate)
  }

  const handleModifiersChange = (m: RenderModifiers) => {
    setModifiers(m)
  }

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) {
      setError('الرجاء رفع ملف أولاً')
      return
    }

    setError(null)
    setStage('uploading')

    try {
      // 1. Upload file + create project
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('projectName', 'مشروع جديد')
      formData.append('renderType', renderType)
      formData.append('template', template)
      formData.append('modifiers', JSON.stringify(modifiers))
      formData.append('customPrompt', customPrompt)
      referenceFiles.forEach((f) => formData.append('referenceFiles', f))

      const res = await fetch('/api/project/create', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'فشل إنشاء المشروع')
      }

      const { projectId: id } = await res.json()
      setProjectId(id)
      setStage('generating')

      // 2. Connect to SSE for generation progress
      const eventSource = new EventSource(`/api/generate?projectId=${id}`)

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.error) {
          setError(data.error)
          eventSource.close()
          setStage('error')
          return
        }

        if (data.renderUrl || data.status === 'complete') {
          eventSource.close()
          setStage('complete')
          // Redirect to project page after short delay
          setTimeout(() => {
            router.push(`/dashboard/projects/${id}`)
          }, 1500)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        setError('انقطع الاتصال بالخادم')
        setStage('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      setStage('error')
    }
  }, [selectedFile, renderType, template, modifiers, customPrompt, referenceFiles, router])

  const handleBack = () => {
    if (stage === 'generating') return
    setSelectedFile(null)
    setReferenceFiles([])
    setStage('idle')
    setError(null)
  }

  const handleSavePreset = async (name: string) => {
    // TODO: Call save preset API when backend is ready
    console.log('Save preset:', name, { renderType, template, modifiers, customPrompt })
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* ── Left Panel: Options ─────────────────────────────── */}
      <LeftPanel
        renderType={renderType}
        modifiers={modifiers}
        onModifiersChange={handleModifiersChange}
      />

      {/* ── Right: Main content ──────────────────────────────── */}
      <div className="flex-1 max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-[#1E3A5F]">
            لوحة التحكم
          </Link>
          <span>/</span>
          <span className="text-gray-900">مشروع جديد</span>
        </div>

        {/* Render type tabs */}
        <RenderTypeTabs value={renderType} onChange={setRenderType} />

        {/* Template pills */}
        <TemplatePills renderType={renderType} value={template} onChange={handleTemplateChange} />

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Compute values BEFORE any conditional to avoid TS type narrowing issues */}
          {((): ReactNode => {
            // isProcessing is computed from full stage type
            const isProcessing = stage === 'uploading' || stage === 'generating'

            if (stage === 'uploading') {
              return (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">جاري رفع الملف...</p>
                </div>
              )
            }

            if (stage === 'generating' && projectId) {
              return (
                <GenerationProgress
                  projectId={projectId}
                  onCancel={() => {
                    setStage('idle')
                    setProjectId(null)
                  }}
                />
              )
            }

            // idle | error states — show the full form
            return (
              <>
                {/* Upload zone */}
                <DropZone
                  onFileSelected={setSelectedFile}
                  isProcessing={isProcessing}
                />

                {/* Selected file preview */}
                {selectedFile && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Custom prompt */}
                <PromptInput value={customPrompt} onChange={setCustomPrompt} />

                {/* Reference images */}
                <ReferenceImages files={referenceFiles} onChange={setReferenceFiles} />

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 text-right">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSavePreset(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    💾 حفظ كقالب
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedFile}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    توليد
                  </button>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Save preset modal */}
      {showSavePreset && (
        <SavePresetModal
          renderType={renderType}
          template={template}
          modifiers={modifiers}
          customPrompt={customPrompt}
          onSave={handleSavePreset}
          onClose={() => setShowSavePreset(false)}
        />
      )}
    </div>
  )
}
