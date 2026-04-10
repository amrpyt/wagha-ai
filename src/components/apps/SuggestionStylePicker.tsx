'use client'

interface StyleOption {
  id: string
  label: string
  description: string
  icon: string
  template: string // maps to exterior template for prompt building
  color: string
}

const SUGGESTION_STYLES: StyleOption[] = [
  { id: 'modern', label: 'حديث', description: 'تصميم معماري حديث', icon: '🏢', template: 'modern', color: '#1E3A5F' },
  { id: 'classic', label: 'كلاسيكي', description: 'طراز كلاسيكي', icon: '🏛️', template: 'classic', color: '#8B4513' },
  { id: 'minimal', label: 'مينيمال', description: 'بساطة وأناقة', icon: '⬜', template: 'minimal', color: '#666666' },
  { id: 'villa', label: 'فيلا', description: 'فيلا فاخرة', icon: '🏡', template: 'villa', color: '#2D6A4F' },
  { id: 'commercial', label: 'تجاري', description: 'مبنى تجاري', icon: '🏬', template: 'commercial', color: '#7B2D8E' },
  { id: 'landscape', label: 'مشهد', description: 'تصميم المناظر الطبيعية', icon: '🌳', template: 'landscape', color: '#228B22' },
  { id: 'tropical', label: 'استوائي', description: 'تصميم استوائي', icon: '🌴', template: 'modern', color: '#FF6B35' },
  { id: 'nordic', label: 'نورديك', description: 'تصميم شمال أوروبا', icon: '❄️', template: 'minimal', color: '#87CEEB' },
  { id: 'mediterranean', label: 'متوسط', description: 'طراز البحر المتوسط', icon: '🌊', template: 'classic', color: '#4682B4' },
  { id: 'industrial', label: 'صناعي', description: 'طراز صناعي', icon: '🏭', template: 'commercial', color: '#708090' },
  { id: 'arabic', label: 'عربي', description: 'تصميم عربي أصيل', icon: '🕌', template: 'classic', color: '#8B0000' },
  { id: 'japanese', label: 'ياباني', description: 'تصميم ياباني', icon: '⛩️', template: 'minimal', color: '#FFB6C1' },
]

interface SuggestionStylePickerProps {
  selectedStyles: string[]
  onStylesChange: (styles: string[]) => void
}

export function SuggestionStylePicker({ selectedStyles, onStylesChange }: SuggestionStylePickerProps) {
  const toggle = (id: string) => {
    if (selectedStyles.includes(id)) {
      onStylesChange(selectedStyles.filter(s => s !== id))
    } else {
      onStylesChange([...selectedStyles, id])
    }
  }

  const selectAll = () => {
    onStylesChange(SUGGESTION_STYLES.map(s => s.id))
  }

  const clearAll = () => {
    onStylesChange([])
  }

  return (
    <div className="space-y-4">
      {/* Header with select all/clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {selectedStyles.length} نمط مختار
        </p>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-[#1E3A5F] hover:underline cursor-pointer"
          >
            اختيار الكل
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:underline cursor-pointer"
          >
            إلغاء الكل
          </button>
        </div>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {SUGGESTION_STYLES.map((style) => {
          const isSelected = selectedStyles.includes(style.id)
          return (
            <button
              key={style.id}
              onClick={() => toggle(style.id)}
              className={`
                relative p-3 rounded-lg border text-right transition-all cursor-pointer
                ${isSelected
                  ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 right-0 w-full h-1 rounded-t-lg"
                style={{ backgroundColor: style.color }}
              />

              {/* Icon */}
              <span className="text-2xl block mt-1">{style.icon}</span>

              {/* Label */}
              <p className="text-sm font-medium text-gray-900 mt-2">{style.label}</p>

              {/* Description */}
              <p className="text-xs text-gray-500 mt-1 leading-tight">{style.description}</p>

              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Re-export SUGGESTION_STYLES so the page can map ids to labels
export { SUGGESTION_STYLES }
