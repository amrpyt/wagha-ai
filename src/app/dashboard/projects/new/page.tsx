'use client'

import { useState, useCallback, Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { DropZone } from '@/components/upload/DropZone'
import { PromptInput } from '@/components/upload/PromptInput'
import { ReferenceImages } from '@/components/upload/ReferenceImages'
import { SavePresetModal } from '@/components/modals/SavePresetModal'
import { GenerationProgress } from '@/components/upload/GenerationProgress'
import { BeforeAfterSlider } from '@/components/upload/BeforeAfterSlider'
import { LeftPanel } from '@/components/upload/LeftPanel'
import { RenderTypeTabs } from '@/components/upload/RenderTypeTabs'
import { TemplatePills } from '@/components/upload/TemplatePills'
import type { RenderType, RenderModifiers, ExteriorTemplate, InteriorTemplate } from '@/lib/ai/prompts'
import { getTemplateModifiers } from '@/lib/ai/prompts'

type CanvasState = 'empty' | 'image-loaded' | 'generating' | 'complete'

interface VersionEntry {
  id: string
  inputUrl: string
  renderUrl: string
}

// Inner component that uses useSearchParams
function NewProjectPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── Render configuration (from URL params or defaults) ─────────────
  const initialRenderType: RenderType =
    (searchParams.get('type') as RenderType) || 'exterior'
  const initialTemplate = (searchParams.get('template') || 'modern') as ExteriorTemplate | InteriorTemplate
  const initialModifiers = getTemplateModifiers(initialRenderType, initialTemplate)

  const [renderType, setRenderType] = useState<RenderType>(initialRenderType)
  const [template, setTemplate] = useState<ExteriorTemplate | InteriorTemplate>(initialTemplate)
  const [modifiers, setModifiers] = useState<RenderModifiers>(initialModifiers)
  const [customPrompt, setCustomPrompt] = useState('')

  // ── File state ────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])

  // ── Canvas state ─────────────────────────────────────────────────
  const [canvasState, setCanvasState] = useState<CanvasState>('empty')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null) // stable ID for generations
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [activeVersionIndex, setActiveVersionIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSavePreset, setShowSavePreset] = useState(false)

  // ── Canvas image preview URL ──────────────────────────────────────
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  // Create object URL for selected file
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setImagePreviewUrl(url)
      previewUrlRef.current = url
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreviewUrl(null)
      previewUrlRef.current = null
    }
  }, [selectedFile])

  // ── Handlers ──────────────────────────────────────────────────────

  const handleTemplateChange = (t: ExteriorTemplate | InteriorTemplate) => {
    setTemplate(t)
    setModifiers(getTemplateModifiers(renderType, t))
  }

  const handleModifiersChange = (m: RenderModifiers) => {
    setModifiers(m)
  }

  const handleRenderTypeChange = (t: RenderType) => {
    setRenderType(t)
    const firstTemplate: ExteriorTemplate | InteriorTemplate = t === 'exterior' ? 'modern' : 'residential'
    setTemplate(firstTemplate)
    setModifiers(getTemplateModifiers(t, firstTemplate))
  }

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setCanvasState('image-loaded')
    setError(null)
  }

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) {
      setError('الرجاء رفع ملف أولاً')
      return
    }

    setError(null)
    setCanvasState('generating')

    try {
      const targetProjectId = currentProjectId || projectId

      // ── Step 1: Create project (first time only) ──────────────────
      let pid: string
      if (!targetProjectId) {
        const createFormData = new FormData()
        createFormData.append('file', selectedFile)
        createFormData.append('projectName', 'مشروع جديد')
        createFormData.append('renderType', renderType)
        createFormData.append('template', template)
        createFormData.append('modifiers', JSON.stringify(modifiers))
        createFormData.append('customPrompt', customPrompt)
        referenceFiles.forEach((f) => createFormData.append('referenceFiles', f))

        const createRes = await fetch('/api/project/create', {
          method: 'POST',
          body: createFormData,
        })

        if (!createRes.ok) {
          const data = await createRes.json().catch(() => ({}))
          throw new Error(data.error || 'فشل إنشاء المشروع')
        }

        const { projectId: id } = await createRes.json()
        pid = id
        setProjectId(id)
        setCurrentProjectId(id)
      } else {
        pid = targetProjectId
      }

      // ── Step 2: SSE for generation ───────────────────────────────
      const eventSource = new EventSource(`/api/generate?projectId=${pid}`)

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.error) {
          setError(data.error)
          eventSource.close()
          setCanvasState('image-loaded')
          return
        }

        if (data.renderUrl) {
          eventSource.close()

          const newVersion: VersionEntry = {
            id: `${Date.now()}`,
            inputUrl: previewUrlRef.current || imagePreviewUrl || '',
            renderUrl: data.renderUrl,
          }
          setVersions((prev) => [...prev, newVersion])
          setActiveVersionIndex((prev) => prev) // stay on newest
          setCanvasState('complete')

          // Update projectId so subsequent generations reuse this project
          if (!currentProjectId && !projectId) {
            setProjectId(pid)
            setCurrentProjectId(pid)
          }
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        setError('انقطع الاتصال بالخادم')
        setCanvasState('image-loaded')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      setCanvasState('image-loaded')
    }
  }, [selectedFile, renderType, template, modifiers, customPrompt, referenceFiles, projectId, currentProjectId, imagePreviewUrl])

  const handleGenerationComplete = useCallback((renderUrl: string) => {
    // Inline mode completion
  }, [])

  const handleReset = () => {
    setSelectedFile(null)
    setVersions([])
    setActiveVersionIndex(0)
    setCanvasState('empty')
    setError(null)
    setProjectId(null)
    setCurrentProjectId(null)
  }

  const handleSavePreset = async (name: string) => {
    console.log('Save preset:', name, { renderType, template, modifiers, customPrompt })
  }

  // ── Derived values ────────────────────────────────────────────────
  const activeVersion = versions[activeVersionIndex]
  const isGenerating = canvasState === 'generating'
  const hasVersions = versions.length > 0

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <LeftPanel
        renderType={renderType}
        modifiers={modifiers}
        onModifiersChange={handleModifiersChange}
      />

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-[#1E3A5F]">
            لوحة التحكم
          </Link>
          <span>/</span>
          <span className="text-gray-900">مشروع جديد</span>
        </div>

        {/* Render type + template */}
        <div className="flex flex-col gap-3">
          <RenderTypeTabs value={renderType} onChange={handleRenderTypeChange} />
          <TemplatePills renderType={renderType} value={template} onChange={handleTemplateChange} />
        </div>

        {/* ── Canvas Area ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Top action bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            {hasVersions && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                مشروع جديد
              </button>
            )}
            {!hasVersions && <div />}

            {hasVersions && (
              <span className="text-sm text-gray-400">
                {versions.length} {(versions.length === 1 ? 'نسخة' : 'نسخ')}
              </span>
            )}
          </div>

          {/* Canvas — state-dependent */}
          <div className="relative" style={{ height: '520px' }}>
            {/* EMPTY: Show dropzone as hero */}
            {canvasState === 'empty' && (
              <div className="h-full">
                <DropZone
                  onFileSelected={handleFileSelected}
                  isProcessing={isGenerating}
                />
              </div>
            )}

            {/* IMAGE LOADED (before first generation): show image preview */}
            {canvasState === 'image-loaded' && imagePreviewUrl && (
              <div className="h-full flex items-center justify-center bg-gray-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviewUrl}
                  alt="الصورة المرفوعة"
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            )}

            {/* GENERATING: progress overlay on canvas */}
            {canvasState === 'generating' && projectId && (
              <div className="h-full flex flex-col">
                {/* Dimmed canvas background */}
                <div className="flex-1 relative">
                  {imagePreviewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreviewUrl} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  {/* Progress overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md mx-4">
                      <GenerationProgress
                        projectId={projectId}
                        onCancel={handleReset}
                        inlineMode
                        onComplete={handleGenerationComplete}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETE: BeforeAfterSlider + optional prompt/reference strip */}
            {canvasState === 'complete' && activeVersion && (
              <div className="h-full flex flex-col relative">
                {/* Download button — top right of canvas */}
                <div className="absolute top-3 left-3 z-10">
                  <a
                    href={activeVersion.renderUrl}
                    download={`${projectId || 'render'}-render.jpg`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-sm shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    تحميل JPG
                  </a>
                </div>
                <div className="flex-1">
                  <BeforeAfterSlider
                    before={activeVersion.inputUrl}
                    after={activeVersion.renderUrl}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom controls (always visible) ──────────────────── */}
          <div className="px-4 py-4 space-y-4 border-t border-gray-100">
            {/* Prompt input */}
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
                disabled={!selectedFile || isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    توليد
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Version Strip ──────────────────────────────────────── */}
        {hasVersions && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-right">النسخ السابقة</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVersionIndex(i)}
                  className={`
                    relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                    ${i === activeVersionIndex ? 'border-[#1E3A5F]' : 'border-transparent hover:border-gray-300'}
                  `}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.renderUrl}
                    alt={`نسخة ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-0.5">
                    v{i + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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

// Wrap in Suspense for useSearchParams
export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><div className="w-8 h-8 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>}>
      <NewProjectPageInner />
    </Suspense>
  )
}
