'use client'

import { useEffect, useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

interface PointsBadgeProps {
  points: number
}

export function PointsBadge({ points }: PointsBadgeProps) {
  const spring = useSpring(points, { stiffness: 200, damping: 30 })
  const prevRef = useRef(points)

  useEffect(() => {
    if (points !== prevRef.current) {
      prevRef.current = points
      spring.set(points)
    }
  }, [points, spring])

  if (points === 0) return null

  return (
    <motion.div
      className="flex items-center gap-1 px-2.5 py-1 rounded-pill bg-amber-100 text-amber-700"
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-sm">⭐</span>
      <span className="text-xs font-bold">{points}</span>
    </motion.div>
  )
}
