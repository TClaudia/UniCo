'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '@/icons/logo.png'
import { StreakBadge } from '@/components/gamification/StreakBadge'
import { PointsBadge } from '@/components/gamification/PointsBadge'
import { getProfile } from '@/lib/storage'

const NAV = [
  {
    href: '/dashboard',
    label: 'Acasă',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Coach AI',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/trivia',
    label: 'Trivia',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const refresh = () => {
      const p = getProfile()
      if (p) {
        setStreak(p.gamification.streak_days)
        setPoints(p.gamification.points)
      }
    }
    refresh()
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-uc-gray-100 fixed inset-y-0 left-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-uc-gray-100 flex-shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
        >
          <Image src={logo} alt="UniCredit" width={34} height={34} className="object-contain" />
          <div className="text-left">
            <div className="font-display font-bold text-[13px] text-uc-black leading-tight">UniCredit</div>
            <div className="text-[11px] text-uc-red font-semibold leading-tight uppercase tracking-wide">AI Coach</div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-uc-gray-400 uppercase tracking-widest">
          Navigare
        </p>
        {NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn mb-0.5 transition-all text-left group ${
                isActive
                  ? 'bg-red-50 text-uc-red'
                  : 'text-uc-gray-700 hover:bg-uc-gray-100 hover:text-uc-black'
              }`}
            >
              <span className="flex-shrink-0 transition-transform group-hover:scale-105">
                {item.icon(isActive)}
              </span>
              <span className={`text-sm leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-uc-red flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Gamification badges */}
      <div className="px-4 py-4 border-t border-uc-gray-100 flex-shrink-0">
        <p className="text-[10px] font-semibold text-uc-gray-400 uppercase tracking-widest mb-2.5">
          Progresul tău
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <StreakBadge days={streak} />
          <PointsBadge points={points} />
        </div>
      </div>
    </aside>
  )
}
