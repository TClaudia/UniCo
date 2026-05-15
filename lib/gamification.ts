import { UserProfile, RiskProfile } from '@/types'
import { getProfile, updateGamification, saveProfile } from '@/lib/storage'

export function addPoints(amount: number): void {
  const profile = getProfile()
  if (!profile) return
  updateGamification({
    points: profile.gamification.points + amount,
  })
}

export function unlockBadge(badge: string): void {
  const profile = getProfile()
  if (!profile) return
  if (profile.gamification.badges.includes(badge)) return
  updateGamification({
    badges: [...profile.gamification.badges, badge],
  })
}

export function updateStreak(): void {
  const profile = getProfile()
  if (!profile) return

  const today = new Date().toISOString().split('T')[0]
  const lastLogin = profile.gamification.last_login
    ? profile.gamification.last_login.split('T')[0]
    : null

  if (lastLogin === today) return // Already logged in today

  let newStreak = profile.gamification.streak_days

  if (lastLogin) {
    const lastDate = new Date(lastLogin)
    const todayDate = new Date(today)
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      // Consecutive day
      newStreak = profile.gamification.streak_days + 1
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  updateGamification({
    streak_days: newStreak,
    last_login: new Date().toISOString(),
  })

  // Streak badges
  if (newStreak >= 7) {
    unlockBadge('streak_7')
  }
  if (newStreak >= 30) {
    unlockBadge('streak_30')
  }
}

export function calculateRiskProfile(
  profile: Pick<UserProfile, 'age' | 'income_bracket' | 'savings' | 'goals'>
): RiskProfile {
  const { age, income_bracket, savings, goals } = profile

  // Conservative conditions
  if (age > 55 || income_bracket === 'under_3000') {
    return 'conservative'
  }

  // Growth conditions
  const highIncome =
    income_bracket === '8000_15000' || income_bracket === 'over_15000'
  const goodSavings = savings.value > 1000
  const hasInvestmentGoal = goals.includes('investment')

  if (highIncome && goodSavings && hasInvestmentGoal) {
    return 'growth'
  }

  // Default moderate
  return 'moderate'
}

export function incrementTriviaCorrect(): void {
  const profile = getProfile()
  if (!profile) return
  const newCount = profile.gamification.trivia_correct + 1
  updateGamification({ trivia_correct: newCount })

  // Trivia badges
  if (newCount >= 10) {
    unlockBadge('trivia_10')
  }
  if (newCount >= 50) {
    unlockBadge('trivia_50')
  }
}

export function initializeGamification(profile: UserProfile): UserProfile {
  return {
    ...profile,
    gamification: {
      points: 50,
      streak_days: 1,
      last_login: new Date().toISOString(),
      badges: ['first_steps'],
      trivia_correct: 0,
    },
  }
}

export const BADGE_LABELS: Record<string, string> = {
  first_steps: '🎯 Primii Pași',
  streak_7: '🔥 7 Zile Consecutiv',
  streak_30: '⚡ 30 Zile Consecutiv',
  trivia_10: '🧠 10 Răspunsuri Corecte',
  trivia_50: '🏆 Expert Financiar',
  chat_first: '💬 Prima Conversație',
  goals_set: '🎯 Obiective Definite',
  profile_complete: '✅ Profil Complet',
}
