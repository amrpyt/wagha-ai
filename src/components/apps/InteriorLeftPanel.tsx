'use client'

import { CollapsibleSection } from '@/components/upload/CollapsibleSection'
import { OptionSelect } from '@/components/upload/OptionSelect'
import type { InteriorModifiers } from '@/lib/ai/prompts'

interface InteriorLeftPanelProps {
  modifiers: InteriorModifiers
  onModifiersChange: (m: InteriorModifiers) => void
}

export function InteriorLeftPanel({ modifiers, onModifiersChange }: InteriorLeftPanelProps) {
  const update = (key: keyof InteriorModifiers, value: unknown) => {
    onModifiersChange({ ...modifiers, [key]: value })
  }

  return (
    <div
      className="w-72 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 140px)' }}
    >
      {/* Room Type */}
      <div className="px-4">
        <CollapsibleSection title="🚪 نوع الغرفة">
          <OptionSelect
            label="نوع الغرفة"
            value={modifiers.roomType || ''}
            options={[
              { value: 'living', label: 'صالة معيشة' },
              { value: 'bedroom', label: 'غرفة نوم' },
              { value: 'kitchen', label: 'مطبخ' },
              { value: 'bathroom', label: 'حمام' },
              { value: 'office', label: 'مكتب' },
              { value: 'retail', label: 'متجر' },
            ]}
            onChange={(v) => update('roomType', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Furniture Style */}
      <div className="px-4">
        <CollapsibleSection title="🛋️ الأثاث">
          <OptionSelect
            label="أسلوب الأثاث"
            value={modifiers.furnitureStyle || ''}
            options={[
              { value: 'modern', label: 'حديث' },
              { value: 'classic', label: 'كلاسيكي' },
              { value: 'minimalist', label: 'مينيمال' },
              { value: 'traditional', label: 'تقليدي' },
            ]}
            onChange={(v) => update('furnitureStyle', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Color Palette */}
      <div className="px-4">
        <CollapsibleSection title="🎨 لوحة الألوان">
          <OptionSelect
            label="لوحة الألوان"
            value={modifiers.colorPalette || ''}
            options={[
              { value: 'warm', label: 'دافئ' },
              { value: 'cool', label: 'بارد' },
              { value: 'neutral', label: 'محايد' },
              { value: 'bold', label: 'جريء' },
            ]}
            onChange={(v) => update('colorPalette', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Lighting Mood */}
      <div className="px-4">
        <CollapsibleSection title="💡 الإضاءة">
          <OptionSelect
            label="مزاج الإضاءة"
            value={modifiers.lightingMood || ''}
            options={[
              { value: 'natural', label: 'طبيعي' },
              { value: 'artificial', label: 'صناعي' },
              { value: 'moody', label: 'خافت' },
            ]}
            onChange={(v) => update('lightingMood', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Decor Style */}
      <div className="px-4 pb-4">
        <CollapsibleSection title="🏠 أسلوب الديكور">
          <OptionSelect
            label="أسلوب الديكور"
            value={modifiers.decorStyle || ''}
            options={[
              { value: 'minimalist', label: 'مينيمال' },
              { value: 'maximalist', label: 'غني' },
              { value: 'industrial', label: 'صناعي' },
              { value: 'scandinavian', label: 'اسكندنافي' },
            ]}
            onChange={(v) => update('decorStyle', v || undefined)}
          />
        </CollapsibleSection>
      </div>
    </div>
  )
}
