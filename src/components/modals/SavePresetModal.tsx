'use client'

import { useState } from 'react'
import type { RenderType, RenderModifiers } from '@/lib/ai/prompts'

interface SavePresetModalProps {
  renderType: RenderType
  template: string
  modifiers: RenderModifiers
  customPrompt: string
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export function SavePresetModal({
  renderType,
  template,
  modifiers,
  customPrompt,
  onSave,
  onClose,
}: SavePresetModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 text-right mb-4">
          💾 حفظ كقالب
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: فيلا مع حديقة"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-gray-900 mb-4"
          dir="rtl"
          autoFocus
        />

        <div className="text-xs text-gray-500 text-right mb-4 space-y-1">
          <p>النوع: {renderType === 'exterior' ? 'خارجي' : 'داخلي'}</p>
          <p>القالب: {template}</p>
          {customPrompt && <p>التعليمات: {customPrompt.slice(0, 50)}...</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 py-2 px-4 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#162d4a] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}
