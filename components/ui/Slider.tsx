'use client'

import { motion } from 'framer-motion'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  showTicks?: boolean
  tickValues?: number[]
  tickLabels?: string[]
  formatValue?: (val: number) => string
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  showTicks = false,
  tickValues = [],
  tickLabels = [],
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {/* Track */}
      <div className="relative h-6 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 bg-uc-gray-100 rounded-pill" />

        {/* Filled track */}
        <motion.div
          className="absolute left-0 h-2 bg-uc-red rounded-pill"
          style={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Native range input (accessible) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-6"
          style={{ WebkitAppearance: 'none', zIndex: 10 }}
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-white border-2 border-uc-red shadow-md pointer-events-none"
          style={{
            left: `calc(${percentage}% - 12px)`,
            boxShadow: '0 2px 8px rgba(226, 0, 26, 0.35)',
          }}
          whileTap={{ scale: 1.2 }}
        />
      </div>

      {/* Tick marks */}
      {showTicks && tickValues.length > 0 && (
        <div className="relative mt-3 h-6">
          {tickValues.map((tick, i) => {
            const pos = ((tick - min) / (max - min)) * 100
            const label = tickLabels[i] || String(tick)
            return (
              <div
                key={tick}
                className="absolute flex flex-col items-center transform -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <div className="w-0.5 h-1.5 bg-uc-gray-400 mb-0.5" />
                <span
                  className="text-xs text-uc-gray-400 whitespace-nowrap"
                  style={{ fontSize: '10px' }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
