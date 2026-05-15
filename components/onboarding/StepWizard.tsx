'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressBar } from './ProgressBar'
import { Step0Welcome } from './steps/Step0Welcome'
import { Step1Consent } from './steps/Step1Consent'
import { Step2Age } from './steps/Step2Age'
import { Step3Income } from './steps/Step3Income'
import { Step4Savings } from './steps/Step4Savings'
import { Step5Goals } from './steps/Step5Goals'
import { OnboardingData } from '@/app/onboarding/page'

interface StepWizardProps {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onComplete: (data: OnboardingData) => void
}

const TOTAL_STEPS = 6
const STEP_LABELS = [
  'Bun Venit',
  'Consimțământ',
  'Vârstă',
  'Venit',
  'Economii',
  'Obiective',
]

type Direction = 1 | -1

const variants = {
  enter: (dir: Direction) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: Direction) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

export function StepWizard({ data, onChange, onComplete }: StepWizardProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep(step + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step0Welcome
            isClient={data.is_unicredit_client}
            onChange={(val) => onChange({ ...data, is_unicredit_client: val })}
            onNext={goNext}
          />
        )
      case 1:
        return (
          <Step1Consent
            consent={data.consent}
            onChange={(c) => onChange({ ...data, consent: c })}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 2:
        return (
          <Step2Age
            age={data.age}
            onChange={(age) => onChange({ ...data, age })}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 3:
        return (
          <Step3Income
            income={data.income_bracket}
            onChange={(income) => onChange({ ...data, income_bracket: income })}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 4:
        return (
          <Step4Savings
            savings={data.savings}
            onChange={(s) => onChange({ ...data, savings: s })}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 5:
        return (
          <Step5Goals
            goals={data.goals}
            onChange={(goals) => onChange({ ...data, goals })}
            onNext={handleComplete}
            onBack={goBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-uc-off-white">
      {/* Header */}
      <div className="px-5 pt-safe pt-6 pb-4 bg-white border-b border-uc-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-btn bg-uc-red flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">UC</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-uc-black">UniCredit AI Coach</span>
            <p className="text-xs text-uc-gray-400">Configurare profil</p>
          </div>
        </div>
        {step > 0 && (
          <ProgressBar current={step} total={TOTAL_STEPS - 1} />
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="min-h-full flex flex-col">
              {renderStep()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
