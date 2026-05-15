'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { SavingsType, AvatarEmotion } from '@/types'

interface Step4Props {
  savings: { type: SavingsType; value: number }
  onChange: (s: { type: SavingsType; value: number }) => void
  onNext: () => void
  onBack: () => void
}

function getSavingsEmotion(value: number, type: SavingsType): AvatarEmotion {
  if (value === 0) return 'concerned'
  if (type === 'percent') {
    if (value < 5) return 'thinking'
    if (value < 15) return 'happy'
    if (value >= 20) return 'celebrating'
    return 'enthusiastic'
  } else {
    if (value < 100) return 'thinking'
    if (value < 500) return 'happy'
    return 'celebrating'
  }
}

function getSavingsMessage(value: number, type: SavingsType): string {
  if (value === 0) return 'Hm, zero economii. Haideți să schimbăm asta! 💪'
  if (type === 'percent') {
    if (value < 5) return 'Un start bun! Poți crește treptat procentul.'
    if (value < 10) return 'Bun! Încearcă să ajungi la 10% pentru mai multă siguranță.'
    if (value < 20) return 'Excelent! Ești pe drumul cel bun! 🌟'
    return 'Wow! 20%+ economii - ești un campion! 🏆'
  } else {
    if (value < 100) return 'Fiecare leu contează! Crește suma gradual.'
    if (value < 500) return 'Bun! Economii regulate construiesc averea.'
    if (value < 1000) return 'Excelent! Ești disciplinat financiar! 💪'
    return 'Fantastice economii! Ești pe drumul spre libertate financiară! 🚀'
  }
}

export function Step4Savings({ savings, onChange, onNext, onBack }: Step4Props) {
  const emotion = getSavingsEmotion(savings.value, savings.type)
  const message = getSavingsMessage(savings.value, savings.type)

  const setType = (type: SavingsType) => {
    onChange({
      type,
      value: type === 'percent' ? 10 : 500,
    })
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <h2 className="font-display font-bold text-2xl text-uc-black mb-1">
          Cât economisești lunar?
        </h2>
        <p className="text-uc-gray-400 text-sm mb-6">
          Ne ajută să calculăm când îți poți atinge obiectivele
        </p>

        {/* Avatar and feedback */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-card shadow-chat">
          <AvatarEngine emotion={emotion} size="md" />
          <motion.p
            key={`${savings.value}-${savings.type}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-uc-gray-700 flex-1"
          >
            {message}
          </motion.p>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-uc-gray-100 rounded-pill">
          <button
            onClick={() => setType('percent')}
            className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all ${
              savings.type === 'percent'
                ? 'bg-white text-uc-red shadow-chat'
                : 'text-uc-gray-400'
            }`}
          >
            📊 Procent (%)
          </button>
          <button
            onClick={() => setType('fixed')}
            className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all ${
              savings.type === 'fixed'
                ? 'bg-white text-uc-red shadow-chat'
                : 'text-uc-gray-400'
            }`}
          >
            💰 Sumă fixă (RON)
          </button>
        </div>

        {/* Value display */}
        <div className="text-center mb-6">
          <motion.div
            key={savings.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="inline-flex items-baseline gap-1"
          >
            <span className="text-5xl font-display font-bold text-uc-red">
              {savings.value}
            </span>
            <span className="text-xl font-semibold text-uc-gray-400">
              {savings.type === 'percent' ? '%' : ' RON'}
            </span>
          </motion.div>
          <p className="text-sm text-uc-gray-400 mt-1">
            {savings.type === 'percent' ? 'din venitul lunar' : 'economii lunare'}
          </p>
        </div>

        {/* Slider */}
        {savings.type === 'percent' ? (
          <Slider
            min={0}
            max={50}
            value={savings.value}
            onChange={(val) => onChange({ ...savings, value: val })}
            showTicks
            tickValues={[0, 5, 10, 20, 30, 50]}
            tickLabels={['0%', '5%', '10%', '20%', '30%', '50%']}
          />
        ) : (
          <Slider
            min={0}
            max={5000}
            step={50}
            value={savings.value}
            onChange={(val) => onChange({ ...savings, value: val })}
            showTicks
            tickValues={[0, 500, 1000, 2000, 3000, 5000]}
            tickLabels={['0', '500', '1K', '2K', '3K', '5K']}
          />
        )}

        {/* Tips */}
        <div className="mt-6 p-3 bg-green-50 rounded-btn border border-green-100">
          <p className="text-xs text-uc-green leading-relaxed">
            💡 <strong>Sfat:</strong> {savings.type === 'percent'
              ? 'Regula 20% este considerată standardul de aur al economisirii. Automatizează transferul lunar!'
              : 'Un transfer automat în ziua salariului te ajută să economisești fără a te gândi.'
            }
          </p>
        </div>
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
