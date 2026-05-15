'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null

  const isHot = days >= 7
  const isOnFire = days >= 30

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-pill ${
        isOnFire
          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
          : isHot
          ? 'bg-orange-100 text-orange-600'
          : 'bg-uc-gray-100 text-uc-gray-700'
      }`}
    >
      <motion.span
        animate={isHot ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
        className="text-sm"
      >
        🔥
      </motion.span>
      <AnimatePresence mode="wait">
        <motion.span
          key={days}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          className={`text-xs font-bold ${isOnFire ? 'text-white' : ''}`}
        >
          {days}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
