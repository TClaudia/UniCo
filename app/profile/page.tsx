'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/types'
import { getProfile, clearProfile } from '@/lib/storage'
import { BADGE_LABELS } from '@/lib/gamification'

const INCOME_LABELS: Record<string, string> = {
  under_3000: '< 3.000 RON',
  '3000_5000': '3.000 - 5.000 RON',
  '5000_8000': '5.000 - 8.000 RON',
  '8000_15000': '8.000 - 15.000 RON',
  over_15000: '> 15.000 RON',
}

const RISK_INFO: Record<string, { label: string; color: string; bg: string; description: string }> = {
  conservative: {
    label: 'STARTER',
    color: 'text-uc-blue',
    bg: 'bg-blue-50',
    description: 'Preferi siguranța și produse cu risc scăzut',
  },
  moderate: {
    label: 'ACTIVE',
    color: 'text-uc-amber',
    bg: 'bg-amber-50',
    description: 'Echilibrezi riscul cu potențialul de câștig',
  },
  growth: {
    label: 'OPTIMIZER',
    color: 'text-uc-green',
    bg: 'bg-green-50',
    description: 'Ești deschis la investiții cu randament mai mare',
  },
}

const GOAL_EMOJI: Record<string, string> = {
  car: '🚗',
  house: '🏡',
  investment: '📈',
  emergency_fund: '🛡️',
  vacation: '✈️',
  education: '🎓',
  event: '🎉',
  savings: '💰',
}

const GOAL_LABELS: Record<string, string> = {
  car: 'Mașină',
  house: 'Casă',
  investment: 'Investiții',
  emergency_fund: 'Fond urgență',
  vacation: 'Vacanță',
  education: 'Educație',
  event: 'Eveniment',
  savings: 'Economii',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const p = getProfile()
    if (!p) {
      router.push('/onboarding')
      return
    }
    setProfile(p)
  }, [router])

  const handleReset = () => {
    clearProfile()
    router.push('/onboarding')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uc-off-white">
        <div className="w-8 h-8 rounded-full bg-uc-red animate-pulse" />
      </div>
    )
  }

  const riskInfo = RISK_INFO[profile.risk_profile]
  const memberSince = new Date(profile.created_at).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageWrapper>
      <div className="px-4 py-4 space-y-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-uc-red to-uc-red-dark flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-floating">
              {profile.age}
            </div>
            <p className="mt-3 text-sm text-uc-gray-400">Vârsta ta</p>
            <div className="mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-pill text-sm font-semibold ${riskInfo.bg} ${riskInfo.color}`}>
                Profil {riskInfo.label}
              </span>
            </div>
            <p className="mt-2 text-xs text-uc-gray-400">{riskInfo.description}</p>
            <p className="mt-2 text-xs text-uc-gray-400">Membru din {memberSince}</p>
          </Card>
        </motion.div>

        {/* Financial Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="font-display font-semibold text-uc-black text-base mb-3">Informații financiare</h2>
          <Card>
            <div className="divide-y divide-uc-gray-100">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-uc-gray-700">Venit lunar</span>
                <span className="text-sm font-semibold text-uc-black">{INCOME_LABELS[profile.income_bracket]}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-uc-gray-700">Economii lunare</span>
                <span className="text-sm font-semibold text-uc-black">
                  {profile.savings.value}
                  {profile.savings.type === 'percent' ? '%' : ' RON'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-uc-gray-700">Client UniCredit</span>
                <span className="text-sm font-semibold text-uc-black">
                  {profile.is_unicredit_client ? '✅ Da' : '❌ Nu'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Goals */}
        {profile.goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="font-display font-semibold text-uc-black text-base mb-3">Obiective financiare</h2>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((goal) => (
                <div
                  key={goal}
                  className="flex items-center gap-1.5 bg-white rounded-pill px-3 py-2 shadow-chat"
                >
                  <span>{GOAL_EMOJI[goal]}</span>
                  <span className="text-sm font-medium text-uc-gray-700">{GOAL_LABELS[goal]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="font-display font-semibold text-uc-black text-base mb-3">Statistici</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-uc-red">{profile.gamification.points}</div>
              <div className="text-xs text-uc-gray-400 mt-1">Puncte</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-uc-red">🔥{profile.gamification.streak_days}</div>
              <div className="text-xs text-uc-gray-400 mt-1">Zile streak</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-uc-red">{profile.gamification.trivia_correct}</div>
              <div className="text-xs text-uc-gray-400 mt-1">Trivia OK</div>
            </Card>
          </div>
        </motion.div>

        {/* Badges */}
        {profile.gamification.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="font-display font-semibold text-uc-black text-base mb-3">Insigne câștigate</h2>
            <div className="flex flex-wrap gap-2">
              {profile.gamification.badges.map((badge) => (
                <div
                  key={badge}
                  className="bg-white rounded-pill px-3 py-2 shadow-chat text-sm font-medium text-uc-gray-700"
                >
                  {BADGE_LABELS[badge] || badge}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Consent Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="bg-uc-gray-100">
            <p className="text-xs text-uc-gray-700 font-semibold mb-2">Consimțăminte acordate</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-uc-gray-700">
                <span>{profile.consent.data_processing ? '✅' : '❌'}</span>
                <span>Prelucrare date personale</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-uc-gray-700">
                <span>{profile.consent.ai_disclaimer ? '✅' : '❌'}</span>
                <span>Disclaimer AI</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="pb-4"
        >
          {!showConfirm ? (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowConfirm(true)}
            >
              🗑️ Resetează Profilul
            </Button>
          ) : (
            <Card className="bg-red-50 border border-red-200">
              <p className="text-sm text-uc-black font-semibold mb-3">
                Ești sigur? Toate datele vor fi șterse.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
                  Anulează
                </Button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-uc-red text-white rounded-btn px-4 py-2.5 text-sm font-semibold hover:bg-uc-red-dark transition-colors"
                >
                  Da, șterge
                </button>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}
