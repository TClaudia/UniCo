'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-uc-gray-400 font-medium">
          Pasul {current} din {total}
        </span>
        <span className="text-xs text-uc-red font-semibold">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-uc-gray-100 rounded-pill overflow-hidden">
        <motion.div
          className="h-full bg-uc-red rounded-pill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < current ? 'bg-uc-red' : 'bg-uc-gray-100'
            }`}
            animate={{ scale: i === current - 1 ? 1.3 : 1 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}
