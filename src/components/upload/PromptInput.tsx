'use client'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 text-right mb-1.5">
        ✎ أضف تفاصيل إضافية للتصميم
        <span className="text-gray-400 font-normal mr-2">(اختياري)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="مثال: إضافة حديقة، إضاءة صباحية، نوافذ كبيرة، سطح مسطح..."
        rows={3}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent resize-none text-gray-900 bg-white"
        dir="rtl"
      />
    </div>
  )
}
