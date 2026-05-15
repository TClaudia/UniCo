export type IncomeBracket = 'under_3000' | '3000_5000' | '5000_8000' | '8000_15000' | 'over_15000'
export type FinancialGoal = 'car' | 'house' | 'investment' | 'emergency_fund' | 'vacation' | 'education' | 'event' | 'savings'
export type SavingsType = 'fixed' | 'percent'
export type AvatarEmotion = 'happy' | 'thinking' | 'concerned' | 'enthusiastic' | 'celebrating' | 'informative'
export type RiskProfile = 'conservative' | 'moderate' | 'growth'

export interface UserProfile {
  profile_version: '1.0'
  created_at: string
  updated_at: string
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
  risk_profile: RiskProfile
  gamification: {
    points: number
    streak_days: number
    last_login: string
    badges: string[]
    trivia_correct: number
  }
}

export interface LLMResponse {
  reply: string
  avatar_emotion: AvatarEmotion
  recommended_product: string | null
  product_cta: {
    label: string
    url: string
    type: 'product_page' | 'contact_advisor' | 'calculator'
  } | null
  disclaimer_required: boolean
  gamification_event: {
    points_awarded: number
    badge_unlocked: string | null
    trigger: string
  } | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  product?: string | null
  cta?: LLMResponse['product_cta']
  showDisclaimer?: boolean
}

export interface TriviaCard {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
  category: 'budgeting' | 'investing' | 'credit' | 'savings' | 'taxes'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}
