'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { DropZone } from '@/components/upload/DropZone'
import { SuggestionStylePicker, SUGGESTION_STYLES } from '@/components/apps/SuggestionStylePicker'
import type { StyleOption } from '@/components/apps/SuggestionStylePicker'

type CanvasState = 'empty' | 'image-loaded' | 'generating' | 'complete'

// Results from bulk generation
interface SuggestionResult {
  styleId: string
  styleLabel: string
  inputUrl: string
  renderUrl: string | null
  status: 'pending' | 'generating' | 'complete' | 'error'
  error?: string
}

export default function SuggestionsPage() {
  const renderType: 'exterior' = 'exterior'

  // ── Style selection state ───────────────────────────────────────
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])

  // ── File state ────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // ── Canvas state ─────────────────────────────────────────────────
  const [canvasState, setCanvasState] = useState<CanvasState>('empty')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Canvas image preview URL ──────────────────────────────────────
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  // ── Bulk generation results ─────────────────────────────────────────
  const [results, setResults] = useState<SuggestionResult[]>([])
  const [keptResults, setKeptResults] = useState<Set<string>>(new Set())

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

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setCanvasState('image-loaded')
    setError(null)
    setResults([])
    setKeptResults(new Set())
  }

  // Helper to generate for a single style via SSE
  function generateForStyle(pid: string, style: StyleOption, inputUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/generate?projectId=${pid}&template=${style.template}`)

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.error) {
          eventSource.close()
          reject(new Error(data.error))
          return
        }
        if (data.renderUrl) {
          eventSource.close()
          resolve(data.renderUrl)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        reject(new Error('انقطع الاتصال بالخادم'))
      }
    })
  }

  const handleGenerate = useCallback(async () => {
    if (!selectedFile || selectedStyles.length === 0) return

    setError(null)
    setCanvasState('generating')

    // Initialize results for each style
    const initialResults: SuggestionResult[] = selectedStyles.map(id => {
      const style = SUGGESTION_STYLES.find(s => s.id === id)!
      return {
        styleId: id,
        styleLabel: style.label,
        inputUrl: previewUrlRef.current || '',
        renderUrl: null,
        status: 'pending' as const,
      }
    })
    setResults(initialResults)
    setKeptResults(new Set())

    const firstStyle = SUGGESTION_STYLES.find(s => s.id === selectedStyles[0])!

    try {
      // Create project
      const createFormData = new FormData()
      createFormData.append('file', selectedFile)
      createFormData.append('projectName', 'اقتراحات')
      createFormData.append('renderType', renderType)
      createFormData.append('template', firstStyle.template)
      createFormData.append('modifiers', JSON.stringify({}))
      createFormData.append('customPrompt', '')

      const createRes = await fetch('/api/project/create', {
        method: 'POST',
        body: createFormData,
      })

      if (!createRes.ok) throw new Error('فشل إنشاء المشروع')
      const { projectId: pid } = await createRes.json()
      setProjectId(pid)

      // Generate for each style in parallel
      const generationPromises = selectedStyles.map(async (styleId, index) => {
        const style = SUGGESTION_STYLES.find(s => s.id === styleId)!

        // Update status to generating
        setResults(prev => prev.map((r, i) =>
          i === index ? { ...r, status: 'generating' as const } : r
        ))

        try {
          const renderUrl = await generateForStyle(pid, style, previewUrlRef.current || '')

          setResults(prev => prev.map((r, i) =>
            i === index ? { ...r, renderUrl, status: 'complete' as const } : r
          ))
        } catch (err) {
          setResults(prev => prev.map((r, i) =>
            i === index ? { ...r, error: String(err), status: 'error' as const } : r
          ))
        }
      })

      await Promise.all(generationPromises)
      setCanvasState('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      setCanvasState('image-loaded')
    }
  }, [selectedFile, selectedStyles, renderType])

  const handleReset = () => {
    setSelectedFile(null)
    setResults([])
    setKeptResults(new Set())
    setCanvasState('empty')
    setError(null)
    setProjectId(null)
  }

  const toggleKept = (styleId: string) => {
    setKeptResults(prev => {
      const next = new Set(prev)
      if (next.has(styleId)) {
        next.delete(styleId)
      } else {
        next.add(styleId)
      }
      return next
    })
  }

  const downloadKept = () => {
    keptResults.forEach(styleId => {
      const result = results.find(r => r.styleId === styleId)
      if (result?.renderUrl) {
        const a = document.createElement('a')
        a.href = result.renderUrl
        a.download = `suggestion-${styleId}-render.jpg`
        a.click()
      }
    })
  }

  const isGenerating = canvasState === 'generating'
  const hasResults = results.length > 0

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-[#1E3A5F]">
            لوحة التحكم
          </Link>
          <span>/</span>
          <span className="text-gray-900">اقتراحات التصميم</span>
        </div>

        {/* ── Canvas Area ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Top action bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            {hasResults && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                مشروع جديد
              </button>
            )}
            {!hasResults && <div />}

            {hasResults && (
              <span className="text-sm text-gray-400">
                {results.filter(r => r.status === 'complete').length} / {results.length} نتيجة
              </span>
            )}
          </div>

          {/* Canvas — state-dependent */}
          <div className="relative" style={{ minHeight: '520px' }}>
            {/* EMPTY: Show dropzone + style picker */}
            {canvasState === 'empty' && (
              <div className="h-full space-y-6 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">اختر أنماط التصميم</h2>
                  <p className="text-sm text-gray-500">حدد نمطاً أو أكثر للحصول على اقتراحات متعددة</p>
                </div>
                <SuggestionStylePicker
                  selectedStyles={selectedStyles}
                  onStylesChange={setSelectedStyles}
                />
                <div className="h-px bg-gray-100" />
                <DropZone
                  onFileSelected={handleFileSelected}
                  isProcessing={isGenerating}
                />
              </div>
            )}

            {/* IMAGE LOADED: Show image preview + style picker + generate button */}
            {canvasState === 'image-loaded' && imagePreviewUrl && (
              <div className="h-full flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">اختر أنماط التصميم</h2>
                    <p className="text-sm text-gray-500">حدد نمطاً أو أكثر للحصول على اقتراحات متعددة</p>
                  </div>
                  <div className="text-sm text-gray-400">{selectedStyles.length} نمط مختار</div>
                </div>

                <SuggestionStylePicker
                  selectedStyles={selectedStyles}
                  onStylesChange={setSelectedStyles}
                />

                <div className="h-px bg-gray-100" />

                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="الصورة المرفوعة"
                    className="max-w-full max-h-64 object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* GENERATING: Show image + results grid as they complete */}
            {canvasState === 'generating' && (
              <div className="h-full flex flex-col p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">جاري توليد {results.length} تصميم...</span>
                </div>

                {imagePreviewUrl && (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreviewUrl} alt="" className="max-w-full max-h-40 object-contain rounded opacity-40" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {results.map((result) => (
                    <div key={result.styleId} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {result.status === 'pending' && (
                        <div className="w-full aspect-square flex items-center justify-center">
                          <div className="text-xs text-gray-400">في الانتظار</div>
                        </div>
                      )}
                      {result.status === 'generating' && (
                        <div className="w-full aspect-square flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {result.status === 'complete' && result.renderUrl && (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={result.renderUrl} alt={result.styleLabel} className="w-full aspect-square object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1">
                            {result.styleLabel}
                          </div>
                        </div>
                      )}
                      {result.status === 'error' && (
                        <div className="w-full aspect-square flex items-center justify-center bg-red-50">
                          <span className="text-xs text-red-500">فشل</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETE: Show results grid with selection */}
            {canvasState === 'complete' && (
              <div className="flex flex-col p-6 space-y-4">
                {/* Download bar */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {keptResults.size} نتيجة محددة
                  </p>
                  <button
                    onClick={downloadKept}
                    disabled={keptResults.size === 0}
                    className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg disabled:opacity-50 cursor-pointer text-sm flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    تحميل ({keptResults.size})
                  </button>
                </div>

                {/* Results grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((result) => {
                    const isKept = keptResults.has(result.styleId)
                    return (
                      <div
                        key={result.styleId}
                        className={`
                          relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                          ${isKept ? 'border-[#1E3A5F]' : 'border-transparent'}
                        `}
                        onClick={() => toggleKept(result.styleId)}
                      >
                        {result.status === 'complete' && result.renderUrl && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={result.renderUrl} alt={result.styleLabel} className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                            {isKept && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-white text-sm font-medium">{result.styleLabel}</p>
                            </div>
                          </>
                        )}
                        {result.status === 'error' && (
                          <div className="w-full aspect-square bg-red-50 flex items-center justify-center">
                            <p className="text-red-600 text-sm">فشل التوليد</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom controls ─────────────────────────────────────── */}
          {canvasState === 'image-loaded' && (
            <div className="px-4 py-4 space-y-4 border-t border-gray-100">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 text-right">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!selectedFile || selectedStyles.length === 0 || isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    توليد {selectedStyles.length} تصميم
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
