'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { OnboardingData } from '@/app/onboarding/page'
import { AvatarCharacter, DEFAULT_AVATAR_CONFIG } from '@/components/avatar/AvatarCharacter'

type ConsentData = OnboardingData['consent']

interface Step1Props {
  consent: ConsentData
  onChange: (consent: ConsentData) => void
  onNext: () => void
  onBack: () => void
}

export function Step1Consent({ consent, onChange, onNext, onBack }: Step1Props) {
  const canContinue = consent.data_processing && consent.ai_disclaimer

  const toggle = (field: keyof Omit<ConsentData, 'timestamp'>) => {
    const newVal = !consent[field]
    onChange({
      ...consent,
      [field]: newVal,
      timestamp: canContinue || (field === 'data_processing' ? newVal && consent.ai_disclaimer : consent.data_processing && newVal)
        ? new Date().toISOString()
        : consent.timestamp,
    })
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="flex flex-col items-center mb-6 gap-3">
          <AvatarCharacter config={DEFAULT_AVATAR_CONFIG} emotion="listening" size="sm" />
          <div className="text-center">
            <h2 className="font-display font-bold text-xl text-uc-black">Protecția Datelor</h2>
            <p className="text-sm text-uc-gray-400">Citește și acceptă înainte de a continua</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* GDPR Consent */}
          <button
            onClick={() => toggle('data_processing')}
            className={`w-full text-left p-4 rounded-card border-2 transition-all ${
              consent.data_processing
                ? 'border-uc-green bg-green-50'
                : 'border-uc-gray-100 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                consent.data_processing ? 'bg-uc-green' : 'border-2 border-uc-gray-400 bg-white'
              }`}>
                {consent.data_processing && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-uc-black mb-1">
                  Prelucrarea datelor personale *
                </p>
                <p className="text-xs text-uc-gray-700 leading-relaxed">
                  Sunt de acord ca datele introduse (vârstă, venit, obiective) să fie procesate local pentru personalizarea recomandărilor. Datele rămân stocate exclusiv pe dispozitivul tău.
                </p>
              </div>
            </div>
          </button>

          {/* AI Disclaimer Consent */}
          <button
            onClick={() => toggle('ai_disclaimer')}
            className={`w-full text-left p-4 rounded-card border-2 transition-all ${
              consent.ai_disclaimer
                ? 'border-uc-green bg-green-50'
                : 'border-uc-gray-100 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                consent.ai_disclaimer ? 'bg-uc-green' : 'border-2 border-uc-gray-400 bg-white'
              }`}>
                {consent.ai_disclaimer && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-uc-black mb-1">
                  Disclaimer AI și sfaturi financiare *
                </p>
                <p className="text-xs text-uc-gray-700 leading-relaxed">
                  Înțeleg că răspunsurile oferite de AI au scop educativ și informativ. Nu constituie sfat financiar profesional. Voi consulta un specialist pentru decizii importante.
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-uc-gray-400 mt-4 leading-relaxed">
          * Ambele consimțăminte sunt necesare pentru a continua. Poți retrage consimțământul oricând din secțiunea Profil.
        </p>

        <div className="mt-4 p-3 bg-blue-50 rounded-btn">
          <p className="text-xs text-uc-blue leading-relaxed">
            🔒 <strong>100% privat:</strong> Nicio dată nu este trimisă pe server fără acordul tău explicit. Profilul este stocat local pe dispozitivul tău.
          </p>
        </div>
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
          Continuă →
        </Button>
      </div>
    </div>
  )
}
