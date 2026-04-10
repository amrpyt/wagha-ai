'use client'

// Visual mood/weather cards for ModifierPicker
// Icons map to each modifier option
import type { Mood, Weather, TimeOfDay } from '@/lib/ai/prompts'

const MOOD_OPTIONS: { value: Mood; label: string; color: string }[] = [
  { value: 'neutral', label: 'محايد', color: 'bg-gray-100' },
  { value: 'vibrant', label: 'حيوي', color: 'bg-green-100' },
  { value: 'calm', label: 'هادئ', color: 'bg-blue-100' },
  { value: 'dramatic', label: 'دراماتيكي', color: 'bg-purple-100' },
]

const WEATHER_OPTIONS: { value: Weather; label: string; icon: string }[] = [
  { value: 'clear', label: 'صافٍ', icon: '☀️' },
  { value: 'overcast', label: 'غائم', icon: '☁️' },
  { value: 'rain', label: 'ماطر', icon: '🌧️' },
]

const TIME_OPTIONS: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: 'morning', label: 'صباح', icon: '🌅' },
  { value: 'midday', label: 'ظهر', icon: '🌞' },
  { value: 'goldenHour', label: 'ساعة ذهبية', icon: '🌇' },
  { value: 'night', label: 'ليل', icon: '🌙' },
]

interface ModifierPickerProps {
  mood?: Mood
  weather?: Weather
  timeOfDay?: TimeOfDay
  onMoodChange: (mood?: Mood) => void
  onWeatherChange: (weather?: Weather) => void
  onTimeOfDayChange: (timeOfDay?: TimeOfDay) => void
}

export function ModifierPicker({ mood, weather, timeOfDay, onMoodChange, onWeatherChange, onTimeOfDayChange }: ModifierPickerProps) {
  return (
    <div className="space-y-4">
      {/* Mood */}
      <div>
        <p className="text-xs text-gray-500 mb-2 text-right">المزاج</p>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onMoodChange(mood === opt.value ? undefined : opt.value)}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center
                ${mood === opt.value
                  ? `${opt.color} border-[#1E3A5F] text-[#1E3A5F]`
                  : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div>
        <p className="text-xs text-gray-500 mb-2 text-right">الطقس</p>
        <div className="flex gap-2">
          {WEATHER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onWeatherChange(weather === opt.value ? undefined : opt.value)}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center
                ${weather === opt.value
                  ? 'bg-[#1E3A5F]/10 border-[#1E3A5F] text-[#1E3A5F]'
                  : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div>
        <p className="text-xs text-gray-500 mb-2 text-right">وقت اليوم</p>
        <div className="flex gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTimeOfDayChange(timeOfDay === opt.value ? undefined : opt.value)}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center
                ${timeOfDay === opt.value
                  ? 'bg-[#1E3A5F]/10 border-[#1E3A5F] text-[#1E3A5F]'
                  : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
