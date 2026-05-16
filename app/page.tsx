'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import logo from '@/icons/logo.png'
import { getProfile } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const profile = getProfile()
      router.push(profile ? '/dashboard' : '/onboarding')
    }, 1800)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">

        {/* Logo — scale + fade in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Image
            src={logo}
            alt="UniCredit AI Coach"
            width={108}
            height={108}
            className="object-contain"
            priority
          />
          {/* Shimmer sweep over the logo */}
          <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
            <span className="splash-shimmer absolute inset-0" />
          </span>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="font-display font-bold text-2xl text-uc-black tracking-tight leading-none">
            UniCredit
          </p>
          <p className="text-uc-red font-semibold text-xs mt-1 tracking-[0.2em] uppercase">
            AI Coach
          </p>
        </motion.div>

        {/* Animated loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex gap-1.5"
          aria-label="Se încarcă"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-uc-red inline-block"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.16,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

      </div>
    </div>
  )
}
