'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { AvatarEmotion } from '@/types'

interface Step2Props {
  age: number
  onChange: (age: number) => void
  onNext: () => void
  onBack: () => void
}

function getAgeEmotion(age: number): AvatarEmotion {
  if (age < 25) return 'enthusiastic'
  if (age < 40) return 'happy'
  return 'thinking'
}

function getAgeMessage(age: number): string {
  if (age < 25) return 'Excelent! Tânăr și cu tot viitorul în față! 🚀'
  if (age < 35) return 'Vârsta perfectă pentru a-ți construi averea! 💪'
  if (age < 45) return 'Experiență și potențial - combinație câștigătoare! 📈'
  if (age < 55) return 'Moment ideal pentru a-ți consolida investițiile! 🏦'
  if (age < 65) return 'Planificare inteligentă pentru o pensie liniștită! 🌅'
  return 'Înțelepciunea financiară vine cu experiența! 🌟'
}

export function Step2Age({ age, onChange, onNext, onBack }: Step2Props) {
  const emotion = getAgeEmotion(age)
  const message = getAgeMessage(age)

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <h2 className="font-display font-bold text-2xl text-uc-black mb-1">
          Câți ani ai?
        </h2>
        <p className="text-uc-gray-400 text-sm mb-8">
          Vârsta ne ajută să personalizăm recomandările tale financiare
        </p>

        {/* Avatar and Age Display */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <AvatarEngine emotion={emotion} size="md" />

          <motion.div
            key={age}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl font-display font-bold text-uc-red">
              {age}
            </div>
            <div className="text-uc-gray-400 text-sm font-medium">ani</div>
          </motion.div>

          <motion.div
            key={message}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-white rounded-pill shadow-chat text-center"
          >
            <p className="text-sm text-uc-gray-700 font-medium">{message}</p>
          </motion.div>
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <Slider
            min={18}
            max={80}
            value={age}
            onChange={onChange}
            showTicks
            tickValues={[18, 25, 35, 45, 55, 65, 80]}
            tickLabels={['18', '25', '35', '45', '55', '65', '80']}
          />
        </div>

        {/* Age categories */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { range: '18-30', label: 'Tânăr', emoji: '🎓' },
            { range: '31-50', label: 'Activ', emoji: '💼' },
            { range: '51+', label: 'Senior', emoji: '🏆' },
          ].map((cat) => {
            const [min, max] = cat.range.split('-').map(v => parseInt(v.replace('+', '')))
            const isActive = max
              ? age >= min && age <= max
              : age >= min
            return (
              <div
                key={cat.range}
                className={`text-center p-2 rounded-btn transition-colors ${
                  isActive ? 'bg-red-50 border border-uc-red' : 'bg-white border border-uc-gray-100'
                }`}
              >
                <div className="text-lg">{cat.emoji}</div>
                <div className={`text-xs font-semibold ${isActive ? 'text-uc-red' : 'text-uc-gray-700'}`}>
                  {cat.label}
                </div>
                <div className="text-xs text-uc-gray-400">{cat.range}</div>
              </div>
            )
          })}
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
