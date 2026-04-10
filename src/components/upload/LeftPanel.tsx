'use client'

import { CollapsibleSection } from './CollapsibleSection'
import { OptionSelect } from './OptionSelect'
import { ModifierPicker } from './ModifierPicker'
import type { RenderType, RenderModifiers } from '@/lib/ai/prompts'

interface LeftPanelProps {
  renderType: RenderType
  modifiers: RenderModifiers
  onModifiersChange: (m: RenderModifiers) => void
}

export function LeftPanel({ renderType, modifiers, onModifiersChange }: LeftPanelProps) {
  const update = (key: keyof RenderModifiers, value: unknown) => {
    onModifiersChange({ ...modifiers, [key]: value })
  }

  return (
    <div
      className="w-72 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 140px)' }}
    >
      {/* Geometry */}
      <div className="px-4">
        <CollapsibleSection title="📐 الهندسة">
          <OptionSelect
            label="زاوية الكاميرا"
            value={modifiers.cameraAngle || ''}
            options={[
              { value: 'eyeLevel', label: 'مستوى النظر' },
              { value: 'birdsEye', label: 'منظر علوي' },
              { value: 'drone', label: 'زاوية جوية' },
              { value: 'street', label: 'منظر الشارع' },
            ]}
            onChange={(v) => update('cameraAngle', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Surroundings */}
      <div className="px-4">
        <CollapsibleSection title="🌳 المحيط">
          <OptionSelect
            label="المسطحات الخضراء"
            value={modifiers.greenery || ''}
            options={[
              { value: 'none', label: 'لا شيء' },
              { value: 'some', label: 'بعض' },
              { value: 'lush', label: 'كثيف' },
            ]}
            onChange={(v) => update('greenery', v || undefined)}
          />
          <OptionSelect
            label="المركبات"
            value={modifiers.vehicles || ''}
            options={[
              { value: 'none', label: 'لا شيء' },
              { value: 'some', label: 'بعض' },
            ]}
            onChange={(v) => update('vehicles', v || undefined)}
          />
          <OptionSelect
            label="الأشخاص"
            value={modifiers.people || ''}
            options={[
              { value: 'none', label: 'لا شيء' },
              { value: 'some', label: 'بعض' },
            ]}
            onChange={(v) => update('people', v || undefined)}
          />
          <OptionSelect
            label="عناصر الشارع"
            value={modifiers.streetProps || ''}
            options={[
              { value: 'none', label: 'لا شيء' },
              { value: 'minimal', label: 'بسيط' },
              { value: 'urban', label: 'حضري' },
            ]}
            onChange={(v) => update('streetProps', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Lighting & Atmosphere */}
      <div className="px-4">
        <CollapsibleSection title="💡 الإضاءة والأجواء">
          <ModifierPicker
            mood={modifiers.mood}
            weather={modifiers.weather}
            timeOfDay={modifiers.timeOfDay}
            onMoodChange={(v) => update('mood', v)}
            onWeatherChange={(v) => update('weather', v)}
            onTimeOfDayChange={(v) => update('timeOfDay', v)}
          />
        </CollapsibleSection>
      </div>

      {/* Ground */}
      <div className="px-4">
        <CollapsibleSection title="🏞️ الأرضية">
          <OptionSelect
            label="نوع السطح"
            value={modifiers.ground || ''}
            options={[
              { value: 'concrete', label: 'خرسانة' },
              { value: 'grass', label: 'عشب' },
              { value: 'mixed', label: 'مختلط' },
            ]}
            onChange={(v) => update('ground', v || undefined)}
          />
        </CollapsibleSection>
      </div>

      {/* Annotations */}
      <div className="px-4 pb-4">
        <CollapsibleSection title="📝 التعليقات التوضيحية" defaultOpen={false}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={modifiers.annotations === true}
              onChange={(e) => update('annotations', e.target.checked || undefined)}
              className="w-4 h-4 accent-[#1E3A5F]"
            />
            <span className="text-sm text-gray-600">إضافة تعليقات توضيحية</span>
          </label>
        </CollapsibleSection>
      </div>
    </div>
  )
}
