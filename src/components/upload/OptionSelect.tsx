'use client'

interface OptionItem {
  value: string
  label: string
}

interface OptionSelectProps {
  label: string
  value: string
  options: OptionItem[]
  onChange: (value: string) => void
}

export function OptionSelect({ label, value, options, onChange }: OptionSelectProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-gray-600 text-right flex-shrink-0">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer appearance-none"
        dir="rtl"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
