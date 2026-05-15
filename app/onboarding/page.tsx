'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepWizard } from '@/components/onboarding/StepWizard'
import { UserProfile, IncomeBracket, FinancialGoal, SavingsType } from '@/types'
import { saveProfile } from '@/lib/storage'
import { calculateRiskProfile, initializeGamification } from '@/lib/gamification'

export interface OnboardingData {
  is_unicredit_client: boolean
  consent: {
    data_processing: boolean
    ai_disclaimer: boolean
    timestamp: string
  }
  age: number
  income_bracket: IncomeBracket
  savings: {
    type: SavingsType
    value: number
  }
  goals: FinancialGoal[]
}

const DEFAULT_DATA: OnboardingData = {
  is_unicredit_client: false,
  consent: {
    data_processing: false,
    ai_disclaimer: false,
    timestamp: '',
  },
  age: 30,
  income_bracket: '3000_5000',
  savings: {
    type: 'percent',
    value: 10,
  },
  goals: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)

  const handleComplete = (finalData: OnboardingData) => {
    const riskProfile = calculateRiskProfile({
      age: finalData.age,
      income_bracket: finalData.income_bracket,
      savings: finalData.savings,
      goals: finalData.goals,
    })

    const now = new Date().toISOString()

    let profile: UserProfile = {
      profile_version: '1.0',
      created_at: now,
      updated_at: now,
      is_unicredit_client: finalData.is_unicredit_client,
      consent: finalData.consent,
      age: finalData.age,
      income_bracket: finalData.income_bracket,
      savings: finalData.savings,
      goals: finalData.goals,
      risk_profile: riskProfile,
      gamification: {
        points: 0,
        streak_days: 0,
        last_login: '',
        badges: [],
        trivia_correct: 0,
      },
    }

    profile = initializeGamification(profile)
    saveProfile(profile)
    router.push('/dashboard')
  }

  return (
    <StepWizard
      data={data}
      onChange={setData}
      onComplete={handleComplete}
    />
  )
}
