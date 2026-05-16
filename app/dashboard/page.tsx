'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/types'
import { getProfile } from '@/lib/storage'
import { updateStreak } from '@/lib/gamification'
import { getTopProducts } from '@/lib/matching'

const RISK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  conservative: { label: 'STARTER', color: 'text-uc-blue', bg: 'bg-blue-50' },
  moderate: { label: 'ACTIVE', color: 'text-uc-amber', bg: 'bg-amber-50' },
  growth: { label: 'OPTIMIZER', color: 'text-uc-green', bg: 'bg-green-50' },
}

const INCOME_LABELS: Record<string, string> = {
  under_3000: '< 3.000 RON',
  '3000_5000': '3.000 - 5.000 RON',
  '5000_8000': '5.000 - 8.000 RON',
  '8000_15000': '8.000 - 15.000 RON',
  over_15000: '> 15.000 RON',
}

const TIPS = [
  'Regula 50/30/20: Alocă 50% pentru nevoi, 30% pentru dorințe și 20% pentru economii.',
  'Un fond de urgență de 3-6 luni de cheltuieli te poate salva în situații neprevăzute.',
  'Investițiile regulate, chiar și mici, cresc semnificativ datorită dobânzii compuse.',
  'Plătirea datoriilor cu dobândă mare prima dată economisește bani pe termen lung.',
  'Automatizarea economiilor îți asigură constanța fără efort zilnic.',
]

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

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length))

  useEffect(() => {
    const p = getProfile()
    if (!p) {
      router.push('/onboarding')
      return
    }
    setProfile(p)
    updateStreak()
  }, [router])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uc-off-white">
        <div className="w-8 h-8 rounded-full bg-uc-red animate-pulse" />
      </div>
    )
  }

  const riskInfo = RISK_LABELS[profile.risk_profile]
  const topProducts = getTopProducts(profile, 2)

  return (
    <PageWrapper>
      <div className="px-4 py-4 space-y-4 lg:px-8 lg:py-6 lg:max-w-3xl lg:mx-auto">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-uc-red to-uc-red-dark text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-body">Bun venit înapoi 👋</p>
              <h1 className="text-2xl font-display font-bold mt-1">Coach-ul tău AI</h1>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-0.5 rounded-pill text-xs font-semibold bg-white/20 text-white`}>
                  Profil: {riskInfo.label}
                </span>
                <span className="px-2 py-0.5 rounded-pill text-xs font-semibold bg-white/20 text-white">
                  {INCOME_LABELS[profile.income_bracket]}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.gamification.points}</div>
                  <div className="text-white/70 text-xs">puncte</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.gamification.streak_days}</div>
                  <div className="text-white/70 text-xs">zile streak</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.gamification.badges.length}</div>
                  <div className="text-white/70 text-xs">insigne</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => router.push('/chat')}
            className="bg-white rounded-card p-4 shadow-card flex flex-col items-start gap-2 hover:shadow-floating transition-shadow active:scale-95"
          >
            <span className="text-3xl">💬</span>
            <div>
              <p className="font-display font-semibold text-uc-black text-sm">Chat cu AI</p>
              <p className="text-uc-gray-400 text-xs">Întreabă orice</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/trivia')}
            className="bg-white rounded-card p-4 shadow-card flex flex-col items-start gap-2 hover:shadow-floating transition-shadow active:scale-95"
          >
            <span className="text-3xl">🧠</span>
            <div>
              <p className="font-display font-semibold text-uc-black text-sm">Trivia</p>
              <p className="text-uc-gray-400 text-xs">Câștigă puncte</p>
            </div>
          </button>
        </motion.div>

        {/* Goals Section */}
        {profile.goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="font-display font-semibold text-uc-black text-base mb-3">Obiectivele tale</h2>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((goal) => (
                <div
                  key={goal}
                  className="flex items-center gap-1.5 bg-white rounded-pill px-3 py-1.5 shadow-chat"
                >
                  <span className="text-sm">{GOAL_EMOJI[goal]}</span>
                  <span className="text-xs font-medium text-uc-gray-700">{GOAL_LABELS[goal]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Products */}
        {topProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="font-display font-semibold text-uc-black text-base mb-3">Recomandate pentru tine</h2>
            <div className="space-y-3">
              {topProducts.map((product) => (
                <Card key={product.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-btn bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
                    {product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-uc-black">{product.name}</p>
                    <p className="text-uc-gray-400 text-xs mt-0.5">{product.description}</p>
                    <button
                      onClick={() => window.open(product.cta_url, '_blank')}
                      className="mt-2 text-uc-red text-xs font-semibold hover:underline"
                    >
                      {product.cta_label} →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tip of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div>
                <p className="font-display font-semibold text-sm text-uc-black mb-1">Sfatul zilei</p>
                <p className="text-sm text-uc-gray-700">{TIPS[tipIndex]}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA to Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/chat')}
          >
            Vorbește cu Coach-ul AI 💬
          </Button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
