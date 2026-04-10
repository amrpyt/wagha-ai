'use client'

import type { RenderType, ExteriorTemplate, InteriorTemplate } from '@/lib/ai/prompts'

const EXTERIOR_TEMPLATES: { value: ExteriorTemplate; label: string }[] = [
  { value: 'modern', label: 'حديث' },
  { value: 'classic', label: 'كلاسيكي' },
  { value: 'minimal', label: 'مينيمال' },
  { value: 'villa', label: 'فيلا' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'landscape', label: 'المناظر' },
]

const INTERIOR_TEMPLATES: { value: InteriorTemplate; label: string }[] = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'office', label: 'مكتبي' },
  { value: 'retail', label: 'متاجر' },
]

interface TemplatePillsProps {
  renderType: RenderType
  value: string
  onChange: (template: ExteriorTemplate | InteriorTemplate) => void
}

export function TemplatePills({ renderType, value, onChange }: TemplatePillsProps) {
  const templates = renderType === 'exterior' ? EXTERIOR_TEMPLATES : INTERIOR_TEMPLATES

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {templates.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer
            ${value === t.value
              ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E3A5F]'
            }
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
