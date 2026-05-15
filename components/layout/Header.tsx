'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { StreakBadge } from '@/components/gamification/StreakBadge'
import { PointsBadge } from '@/components/gamification/PointsBadge'
import { getProfile } from '@/lib/storage'

export function Header() {
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const profile = getProfile()
    if (profile) {
      setStreak(profile.gamification.streak_days)
      setPoints(profile.gamification.points)
    }

    // Listen for storage changes to update header
    const handleStorage = () => {
      const p = getProfile()
      if (p) {
        setStreak(p.gamification.streak_days)
        setPoints(p.gamification.points)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-uc-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 active:opacity-70 transition-opacity"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-btn bg-uc-red flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">UC</span>
            </div>
            <div className="ml-2">
              <div className="font-display font-bold text-sm text-uc-black leading-tight">UniCredit</div>
              <div className="text-xs text-uc-red font-medium leading-tight">AI Coach</div>
            </div>
          </div>
        </button>

        {/* Right side badges */}
        <div className="flex items-center gap-2">
          <StreakBadge days={streak} />
          <PointsBadge points={points} />
        </div>
      </div>
    </header>
  )
}
