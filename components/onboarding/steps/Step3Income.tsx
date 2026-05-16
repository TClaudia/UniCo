'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { IncomeBracket } from '@/types'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { AvatarEmotion } from '@/types'

interface Step3Props {
  income: IncomeBracket
  onChange: (income: IncomeBracket) => void
  onNext: () => void
  onBack: () => void
}

const INCOME_OPTIONS: {
  value: IncomeBracket
  label: string
  sub: string
  emoji: string
  color: string
}[] = [
  {
    value: 'under_3000',
    label: 'Sub 3.000 RON',
    sub: 'Venit de bază',
    emoji: '🌱',
    color: 'border-blue-200 bg-blue-50',
  },
  {
    value: '3000_5000',
    label: '3.000 - 5.000 RON',
    sub: 'Venit mediu',
    emoji: '📊',
    color: 'border-indigo-200 bg-indigo-50',
  },
  {
    value: '5000_8000',
    label: '5.000 - 8.000 RON',
    sub: 'Venit peste medie',
    emoji: '💼',
    color: 'border-purple-200 bg-purple-50',
  },
  {
    value: '8000_15000',
    label: '8.000 - 15.000 RON',
    sub: 'Venit ridicat',
    emoji: '🚀',
    color: 'border-green-200 bg-green-50',
  },
  {
    value: 'over_15000',
    label: 'Peste 15.000 RON',
    sub: 'Top earner',
    emoji: '💎',
    color: 'border-amber-200 bg-amber-50',
  },
]

function getIncomeEmotion(income: IncomeBracket): AvatarEmotion {
  if (!income) return 'happy'
  if (income === 'under_3000') return 'concerned'
  if (income === '3000_5000') return 'thinking'
  if (income === '5000_8000') return 'happy'
  return 'enthusiastic'
}

export function Step3Income({ income, onChange, onNext, onBack }: Step3Props) {
  const emotion = getIncomeEmotion(income)

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="flex flex-col items-center mb-4">
          <AvatarEngine emotion={emotion} size="sm" />
        </div>
        <h2 className="font-display font-bold text-2xl text-uc-black mb-1">
          Care este venitul tău lunar?
        </h2>
        <p className="text-uc-gray-400 text-sm mb-6">
          Informație confidențială, stocată local. Ne ajută să găsim produsele potrivite.
        </p>

        <div className="space-y-3">
          {INCOME_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-card border-2 transition-all active:scale-95 ${
                income === opt.value
                  ? 'border-uc-red bg-red-50 shadow-chat'
                  : `${opt.color} hover:border-uc-red/40`
              }`}
            >
              <div className="text-2xl flex-shrink-0">{opt.emoji}</div>
              <div className="text-left flex-1">
                <p className={`font-semibold text-sm ${income === opt.value ? 'text-uc-red' : 'text-uc-black'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-uc-gray-400">{opt.sub}</p>
              </div>
              {income === opt.value && (
                <div className="w-6 h-6 rounded-full bg-uc-red flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-uc-gray-400 mt-4 text-center">
          🔒 Datele sunt stocate local și nu sunt transmise nicăieri
        </p>
      </motion.div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>
          ← Înapoi
        </Button>
        <Button variant="primary" onClick={onNext} className="flex-1">
          Continuă →
        </Button>
      </div>
    </div>
  )
}
