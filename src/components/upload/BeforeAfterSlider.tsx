'use client'

import { useState, useRef, useCallback, type PointerEvent } from 'react'

interface BeforeAfterSliderProps {
  before: string   // original uploaded image URL or path
  after: string    // AI-generated render URL or path
  beforeAlt?: string
  afterAlt?: string
}

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt = 'الصورة الأصلية',
  afterAlt = 'النتيجة',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50) // percentage 0–100
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    updatePosition(e.clientX)

    // Capture pointer for smooth drag outside element
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updatePosition(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition(p => Math.max(0, p - 5))
    if (e.key === 'ArrowRight') setPosition(p => Math.min(100, p + 5))
  }

  return (
    <div className="relative w-full h-full select-none" ref={containerRef}>
      {/* After image (bottom layer) */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={afterAlt}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Before image (top layer, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt={beforeAlt}
          className="h-full object-contain"
          style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] cursor-ew-resize z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        tabIndex={0}
        aria-label="مقارنة قبل وبعد"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={handleKeyDown}
      >
        {/* Drag handle indicator */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-8 h-8 bg-white rounded-full shadow-lg
            flex items-center justify-center
            transition-transform duration-150
            ${isDragging ? 'scale-110' : 'scale-100'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1E3A5F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" transform="translate(6, 0)" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        قبل
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        بعد
      </div>
    </div>
  )
}
