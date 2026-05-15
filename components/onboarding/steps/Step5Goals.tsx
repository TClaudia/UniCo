'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { FinancialGoal } from '@/types'
import { AvatarCharacter, DEFAULT_AVATAR_CONFIG, CharacterEmotion } from '@/components/avatar/AvatarCharacter'

interface Step5Props {
  goals: FinancialGoal[]
  onChange: (goals: FinancialGoal[]) => void
  onNext: () => void
  onBack: () => void
}

const GOALS: {
  value: FinancialGoal
  label: string
  emoji: string
  desc: string
  color: string
}[] = [
  {
    value: 'savings',
    label: 'Economii generale',
    emoji: '💰',
    desc: 'Construiesc un obicei de economisire',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    value: 'emergency_fund',
    label: 'Fond de urgență',
    emoji: '🛡️',
    desc: '3-6 luni de cheltuieli puse deoparte',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    value: 'house',
    label: 'Cumpărare casă',
    emoji: '🏡',
    desc: 'Achiz. imobil sau avans credit ipotecar',
    color: 'bg-green-50 border-green-200',
  },
  {
    value: 'car',
    label: 'Cumpărare mașină',
    emoji: '🚗',
    desc: 'Economii pentru auto sau avans credit',
    color: 'bg-teal-50 border-teal-200',
  },
  {
    value: 'investment',
    label: 'Investiții',
    emoji: '📈',
    desc: 'Fac banii să lucreze pentru mine',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    value: 'vacation',
    label: 'Vacanță de vis',
    emoji: '✈️',
    desc: 'Economisesc pentru vacanța perfectă',
    color: 'bg-sky-50 border-sky-200',
  },
  {
    value: 'education',
    label: 'Educație',
    emoji: '🎓',
    desc: 'Cursuri, studii sau educația copilului',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    value: 'event',
    label: 'Eveniment special',
    emoji: '🎉',
    desc: 'Nuntă, botez sau alt eveniment major',
    color: 'bg-rose-50 border-rose-200',
  },
]

function getGoalsEmotion(count: number): CharacterEmotion {
  if (count === 0) return 'listening'
  if (count <= 2) return 'happy'
  return 'idea'
}

export function Step5Goals({ goals, onChange, onNext, onBack }: Step5Props) {
  const toggleGoal = (goal: FinancialGoal) => {
    if (goals.includes(goal)) {
      onChange(goals.filter(g => g !== goal))
    } else {
      onChange([...goals, goal])
    }
  }

  const canContinue = goals.length > 0
  const avatarEmotion = getGoalsEmotion(goals.length)

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="flex flex-col items-center mb-4">
          <AvatarCharacter config={DEFAULT_AVATAR_CONFIG} emotion={avatarEmotion} size="sm" />
        </div>
        <h2 className="font-display font-bold text-2xl text-uc-black mb-1">
          Ce obiective financiare ai?
        </h2>
        <p className="text-uc-gray-400 text-sm mb-6">
          Selectează unul sau mai multe obiective (minim 1 necesar)
        </p>

        {/* Selected count */}
        <motion.div
          animate={{ opacity: goals.length > 0 ? 1 : 0 }}
          className="mb-4 flex items-center gap-2"
        >
          <div className="flex -space-x-1">
            {goals.slice(0, 3).map((g) => (
              <span key={g} className="text-lg">
                {GOALS.find(opt => opt.value === g)?.emoji}
              </span>
            ))}
          </div>
          {goals.length > 0 && (
            <span className="text-sm font-medium text-uc-green">
              {goals.length} {goals.length === 1 ? 'obiectiv selectat' : 'obiective selectate'} ✓
            </span>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal, i) => {
            const isSelected = goals.includes(goal.value)
            return (
              <motion.button
                key={goal.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => toggleGoal(goal.value)}
                className={`relative flex flex-col items-start p-3 rounded-card border-2 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-uc-red bg-red-50 shadow-chat'
                    : `${goal.color} hover:border-uc-red/40`
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-uc-red flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <span className="text-2xl mb-2">{goal.emoji}</span>
                <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-uc-red' : 'text-uc-black'}`}>
                  {goal.label}
                </p>
                <p className="text-xs text-uc-gray-400 mt-0.5 leading-tight">
                  {goal.desc}
                </p>
              </motion.button>
            )
          })}
        </div>

        {goals.length === 0 && (
          <p className="text-xs text-uc-amber text-center mt-4">
            ⚠️ Selectează cel puțin un obiectiv pentru a continua
          </p>
        )}
      </motion.div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>
          ← Înapoi
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1"
        >
          Finalizează! 🎯
        </Button>
      </div>
    </div>
  )
}
