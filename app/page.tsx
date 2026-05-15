'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const profile = getProfile()
    if (profile) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-uc-off-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-uc-red animate-pulse" />
        <p className="text-uc-gray-400 font-body text-sm">Se încarcă...</p>
      </div>
    </div>
  )
}
