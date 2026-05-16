import { UserProfile, FinancialGoal } from '@/types'

interface ProductRecommendation {
  id: string
  name: string
  description: string
  cta_label: string
  cta_url: string
  cta_type: 'product_page' | 'contact_advisor' | 'calculator'
  emoji: string
}

// URLs kept in sync with the PRODUCT_CATALOG in app/api/chat/route.ts
const PRODUCT_CATALOG: Record<string, ProductRecommendation> = {
  savings_account: {
    id: 'savings_account',
    name: 'Conturi de economii',
    description: 'Dobândă competitivă, fără comisioane lunare',
    cta_label: 'Deschide Cont',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/conturi-de-economii-si-depozite-la-termen.html',
    cta_type: 'product_page',
    emoji: '🏦',
  },
  term_deposit: {
    id: 'term_deposit',
    name: 'Depozite la termen',
    description: 'Randament garantat pe perioadă fixă',
    cta_label: 'Calculează Dobânda',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/intrebarile-tale/depozite.html',
    cta_type: 'product_page',
    emoji: '📈',
  },
  investment_fund: {
    id: 'investment_fund',
    name: 'Fonduri de investiții',
    description: 'Diversifică-ți portofoliul cu fonduri gestionate profesional',
    cta_label: 'Explorează Fondurile',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/Economisire-si-investitii/fonduri-de-investitii.html',
    cta_type: 'product_page',
    emoji: '💹',
  },
  mortgage: {
    id: 'mortgage',
    name: 'Credit ipotecar',
    description: 'Finanțare avantajoasă pentru casa visurilor tale',
    cta_label: 'Calculează Rata',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/credite-ipoteca.html',
    cta_type: 'calculator',
    emoji: '🏡',
  },
  auto_loan: {
    id: 'auto_loan',
    name: 'Credit de realizări personale',
    description: 'Finanțare rapidă pentru mașina ta, fără garanții imobiliare',
    cta_label: 'Aplică Acum',
    cta_url: 'https://www.unicredit.ro/credite/credit-de-realizari-personale.html',
    cta_type: 'product_page',
    emoji: '🚗',
  },
  personal_loan: {
    id: 'personal_loan',
    name: 'Credit de nevoi personale',
    description: 'Fonduri rapide pentru orice nevoie personală',
    cta_label: 'Solicită Ofertă',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/Am-gasit-casa.html',
    cta_type: 'product_page',
    emoji: '💰',
  },
  pension_fund: {
    id: 'pension_fund',
    name: 'Premium Invest',
    description: 'Asigură-ți un viitor financiar confortabil prin economisire și investiții',
    cta_label: 'Descoperă Premium Invest',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/Start-Premium-Invest.html',
    cta_type: 'product_page',
    emoji: '🌅',
  },
  education_savings: {
    id: 'education_savings',
    name: 'Plan de Investiții (RITM)',
    description: 'Investește regulat și construiește capitalul pentru viitor',
    cta_label: 'Află Detalii',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/Campanii/campanie-plan-de-investitii.html',
    cta_type: 'product_page',
    emoji: '🎓',
  },
  travel_insurance: {
    id: 'travel_insurance',
    name: 'Genius Protect',
    description: 'Protecție completă pentru tine și familia ta',
    cta_label: 'Descoperă Genius Protect',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/genius-protect.html',
    cta_type: 'product_page',
    emoji: '✈️',
  },
  emergency_fund_account: {
    id: 'emergency_fund_account',
    name: 'Cont de economii — Fond de urgență',
    description: 'Lichiditate imediată cu dobândă zilnică',
    cta_label: 'Deschide Acum',
    cta_url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/conturi-de-economii-si-depozite-la-termen.html',
    cta_type: 'product_page',
    emoji: '🛡️',
  },
}

export function getRecommendedProducts(profile: UserProfile): string[] {
  const recommended: string[] = []
  const goals = profile.goals as FinancialGoal[]
  const { income_bracket, age, risk_profile, savings } = profile

  // Goal-based recommendations
  if (goals.includes('house')) {
    recommended.push('mortgage')
  }
  if (goals.includes('car')) {
    recommended.push('auto_loan')
  }
  if (goals.includes('investment')) {
    if (risk_profile === 'growth') {
      recommended.push('investment_fund')
    } else {
      recommended.push('term_deposit')
    }
  }
  if (goals.includes('emergency_fund')) {
    recommended.push('emergency_fund_account')
  }
  if (goals.includes('vacation')) {
    recommended.push('travel_insurance')
  }
  if (goals.includes('education')) {
    recommended.push('education_savings')
  }
  if (goals.includes('savings')) {
    recommended.push('savings_account')
  }
  if (goals.includes('event')) {
    recommended.push('personal_loan')
  }

  // Age-based recommendations
  if (age > 45) {
    if (!recommended.includes('pension_fund')) {
      recommended.push('pension_fund')
    }
  }

  // Income-based recommendations
  if (income_bracket === 'over_15000' || income_bracket === '8000_15000') {
    if (!recommended.includes('investment_fund')) {
      recommended.push('investment_fund')
    }
  }

  // Savings behavior recommendations
  if (savings.value === 0) {
    if (!recommended.includes('savings_account')) {
      recommended.unshift('savings_account')
    }
  }

  // Conservative profile: prefer low-risk products
  if (risk_profile === 'conservative') {
    const filtered = recommended.filter(p => p !== 'investment_fund')
    if (!filtered.includes('term_deposit')) {
      filtered.push('term_deposit')
    }
    return Array.from(new Set(filtered))
  }

  return Array.from(new Set(recommended))
}

export function getProductDetails(productId: string): ProductRecommendation | null {
  return PRODUCT_CATALOG[productId] || null
}

export function getTopProducts(profile: UserProfile, limit = 2): ProductRecommendation[] {
  const ids = getRecommendedProducts(profile)
  return ids
    .slice(0, limit)
    .map(id => PRODUCT_CATALOG[id])
    .filter(Boolean)
}
