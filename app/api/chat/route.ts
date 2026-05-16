import { NextRequest, NextResponse } from 'next/server'
import { LLMResponse, AvatarEmotion } from '@/types'

// ─── Raw schema the LLM outputs ──────────────────────────────────────────────
interface LLMRawResponse {
  updated_ai_emotional_state: string
  detected_user_sentiment: string
  chat_response_text: string
  requires_more_info: boolean
  recommended_product: {
    product_name: string | null
    product_key: string | null
    official_product_type: string | null
    matching_justification: string | null
  } | null
}

// ─── Product catalog ─────────────────────────────────────────────────────────
const PRODUCT_CATALOG: Record<string, {
  label: string; url: string; type: 'product_page' | 'contact_advisor' | 'calculator'
}> = {
  cont_curent_online: {
    label: 'Cont curent',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/cont-curent.html',
    type: 'product_page',
  },
  cont_economii: {
    label: 'Conturi de economii',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/conturi-de-economii-si-depozite-la-termen.html',
    type: 'product_page',
  },
  depozit_termen: {
    label: 'Depozite la termen',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/intrebarile-tale/depozite.html',
    type: 'product_page',
  },
  carduri_de_debit: {
    label: 'Carduri de debit',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Tranzactionare/carduri-de-debit.html',
    type: 'product_page',
  },
  unicreditcard: {
    label: 'Carduri de credit UniCreditCard',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/carduri-de-credit.html',
    type: 'product_page',
  },
  card_meniu: {
    label: 'Card Meniu',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Tranzactionare/carduri-de-debit/card-de-masa.html',
    type: 'product_page',
  },
  overdraft: {
    label: 'Descoperit de cont',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/descoperit-de-cont.html',
    type: 'product_page',
  },
  credit_realizari_personale: {
    label: 'Credit de realizări personale',
    url: 'https://www.unicredit.ro/credite/credit-de-realizari-personale.html',
    type: 'product_page',
  },
  credit_imobiliar: {
    label: 'Credit ipotecar',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/credite-ipoteca.html',
    type: 'product_page',
  },
  credit_nevoi_personale: {
    label: 'Credit de nevoi personale',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Credite/Am-gasit-casa.html',
    type: 'product_page',
  },
  fonduri_investitii: {
    label: 'Fonduri de investiții',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Economisire-si-investitii/fonduri-de-investitii.html',
    type: 'product_page',
  },
  plan_investitii: {
    label: 'Plan de Investiții (RITM)',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Campanii/campanie-plan-de-investitii.html',
    type: 'product_page',
  },
  onemarkets_fund: {
    label: 'Onemarkets Fund',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/Economisire-si-investitii/onemarkets-fund.html',
    type: 'product_page',
  },
  asigurare_viata_ipoteca: {
    label: 'Asigurare de viață pentru credite ipotecare',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/asigurare-de-viata-credit-cu-ipoteca.html',
    type: 'product_page',
  },
  asigurare_locuinta: {
    label: 'Asigurare de locuință',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/asigurari-de-locuinte.html',
    type: 'product_page',
  },
  genius_protect: {
    label: 'Genius Protect',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/genius-protect.html',
    type: 'product_page',
  },
  premium_invest: {
    label: 'Premium Invest',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/Start-Premium-Invest.html',
    type: 'product_page',
  },
  umbrella: {
    label: 'Umbrella',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asigurari/Umbrella.html',
    type: 'product_page',
  },
  mobile_banking: {
    label: 'Mobile Banking',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/mobile-banking.html',
    type: 'product_page',
  },
  online_banking: {
    label: 'Online Banking',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta/online-banking.html',
    type: 'product_page',
  },
  shopsmart: {
    label: 'ShopSmart',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/digital/ShopSmart.html',
    type: 'product_page',
  },
  apple_pay: {
    label: 'Apple Pay',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/digital/ApplePay.html',
    type: 'product_page',
  },
  google_pay: {
    label: 'Google Pay',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/digital/google-pay.html',
    type: 'product_page',
  },
  ropay: {
    label: 'RoPay',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/digital/ropay.html',
    type: 'product_page',
  },
  click_to_pay: {
    label: 'Click to Pay',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/digital/click-to-pay.html',
    type: 'product_page',
  },
  fonduri_investitii_companii: {
    label: 'Fonduri de investiții pentru companii',
    url: 'https://www.unicredit.ro/ro/imm/economisire-si-investitii/investitii.html',
    type: 'product_page',
  },
  sanaplan: {
    label: 'SanaPlan',
    url: 'https://www.unicredit.ro/ro/imm/Asigurari/SanaPlan.html',
    type: 'product_page',
  },
  ucfin: {
    label: 'UniCredit Consumer Financing',
    url: 'https://www.ucfin.ro',
    type: 'product_page',
  },
  unicredit_insurance_broker: {
    label: 'UniCredit Insurance Broker',
    url: 'mailto:ROUCBInsuranceHO@unicredit.ro',
    type: 'contact_advisor',
  },
  info_center: {
    label: 'Info Center 24/7',
    url: 'https://www.unicredit.ro/ro/institutional/diverse/contact.html',
    type: 'product_page',
  },
  sucursale_atm: {
    label: 'Sucursale și ATM-uri',
    url: 'https://www.unicredit.ro/ro/institutional/sucursale-atm.html',
    type: 'product_page',
  },
  curs_valutar: {
    label: 'Curs valutar',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/diverse/curs-valutar.html',
    type: 'product_page',
  },
  asistenta_faq: {
    label: 'Asistență și întrebări frecvente',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/asistenta.html',
    type: 'product_page',
  },
  documente_utile_pf: {
    label: 'Documente utile PF',
    url: 'https://www.unicredit.ro/ro/persoane-fizice/diverse/documente-utile.html',
    type: 'product_page',
  },
  documente_utile_imm: {
    label: 'Documente utile IMM',
    url: 'https://www.unicredit.ro/ro/imm/diverse/documente-utile.html',
    type: 'product_page',
  },
  site_principal: {
    label: 'Pagina principală UniCredit România',
    url: 'https://www.unicredit.ro',
    type: 'product_page',
  },
  persoane_fizice: {
    label: 'Persoane fizice',
    url: 'https://www.unicredit.ro/ro/persoane-fizice.html',
    type: 'product_page',
  },
  imm_companii_micro: {
    label: 'IMM & Companii Micro',
    url: 'https://www.unicredit.ro/ro/imm.html',
    type: 'product_page',
  },
  corporate: {
    label: 'Corporate',
    url: 'https://www.unicredit.ro/ro/cib.html',
    type: 'product_page',
  },
  institutional: {
    label: 'Instituțional',
    url: 'https://www.unicredit.ro/ro/institutional.html',
    type: 'product_page',
  },
  unicredit_leasing: {
    label: 'UniCredit Leasing',
    url: 'https://www.unicreditleasing.ro/ro/home.html',
    type: 'product_page',
  },
}

// ─── Emotional state → avatar emotion mapping ─────────────────────────────────
function mapEmotionalState(state: string, sentiment: string): AvatarEmotion {
  const s = `${state} ${sentiment}`.toLowerCase()
  if (s.includes('celebrat'))                                              return 'celebrating'
  if (s.includes('enthusiast') || s.includes('energiz') || s.includes('validat') || s.includes('optimist')) return 'enthusiastic'
  if (s.includes('reassur') || s.includes('protect') || s.includes('empath') || s.includes('compassion') || s.includes('concern') || s.includes('anxious')) return 'concerned'
  if (s.includes('patient') || s.includes('educat') || s.includes('inform') || s.includes('explain'))       return 'informative'
  if (s.includes('analyt') || s.includes('thought') || s.includes('think') || s.includes('reflect'))        return 'thinking'
  return 'happy'
}

// ─── Transform new LLM raw response → existing LLMResponse ───────────────────
function transformResponse(raw: LLMRawResponse, userMessageCount: number): LLMResponse {
  const productKey = raw.recommended_product?.product_key ?? null
  const cta = productKey && PRODUCT_CATALOG[productKey] ? PRODUCT_CATALOG[productKey] : null

  // During discovery phase, avatar thinks; after → map from emotional state
  const avatarEmotion: AvatarEmotion = raw.requires_more_info
    ? 'thinking'
    : mapEmotionalState(raw.updated_ai_emotional_state, raw.detected_user_sentiment)

  const pointsAwarded = userMessageCount <= 3 ? 5 : 10

  return {
    reply: raw.chat_response_text,
    avatar_emotion: avatarEmotion,
    recommended_product: productKey,
    product_cta: cta ? { label: cta.label, url: cta.url, type: cta.type } : null,
    disclaimer_required: !!productKey,
    gamification_event: {
      points_awarded: pointsAwarded,
      badge_unlocked: null,
      trigger: raw.requires_more_info ? 'exploration' : (productKey ? 'product_match' : 'advice'),
    },
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `
# ROLE & CORE OBJECTIVE
You are UniCo, UniCredit Bank România's AI Financial Empathy Engine and product matching assistant.
Your mission: guide users to the right official UniCredit retail products by dynamically adapting to their real-time emotional state, conversation context, and onboarding profile metrics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEHAVIORAL DIRECTIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EMOTIONAL MIRRORING ENGINE
Assess the emotional undertone of the user's message and dynamically match your tone:
• Anxious / worried about money         → Reassuring, protective, grounding tone
• Ambitious / goal-driven               → Forward-looking, energizing, motivating tone
• Confused / overwhelmed                → Clear, patient, step-by-step guidance
• Excited / ready to act                → Enthusiastic validation + concrete next step
• Discouraged / struggling financially  → Empathetic, compassionate, non-judgmental

2. DISCOVERY-FIRST PROTOCOL (count user messages in history)
PHASE 1 — DISCOVERY (fewer than 3 user messages):
• Ask open-ended, conversational follow-up questions
• Explore: current situation, concrete goals, time horizon, financial experience, main concerns
• Do NOT push products — just listen, empathize, and deepen understanding
• Every reply MUST include one natural follow-up question
• Set requires_more_info: true

PHASE 2 — SOLUTIONS (3+ user messages OR user explicitly requests recommendation):
• Offer personalized advice grounded in what you have learned in the conversation
• Justify your recommendation by explicitly referencing conversation details and profile
• Set requires_more_info: false

3. CONTEXT CONTINUITY
Use chat history fully — never re-ask information already shared. Reference past answers to show attentiveness and build trust.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EU AI ACT & BANKING COMPLIANCE — MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Clearly present yourself as an AI assistant — never impersonate a human bank manager
• Frame all suggestions as options: "ar putea fi o opțiune", "merită să analizezi"
• NEVER: guarantee credit approval, promise specific investment returns, request CNP/card/password
• NEVER: provide binding investment mandates or legal/fiscal advice
• ANY turn recommending a product MUST reference a real official UniCredit product from the catalog below

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNICREDIT_PRODUCTS_LIST (Official Catalog)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Cont curent
   Use for: operațiuni zilnice, plăți și gestionarea banilor zilnici
   Key: cont_curent_online

2. Conturi de economii
   Use for: economii flexibile, dobândă calculată zilnic
   Key: cont_economii

3. Depozite la termen
   Use for: economii cu perioadă fixă și dobândă garantată
   Key: depozit_termen

4. Carduri de debit
   Use for: acces 24/24 la cont, plăți contactless și beneficii de tranzacționare
   Key: carduri_de_debit

5. Carduri de credit UniCreditCard
   Use for: cumpărături cu cashback, program de loialitate și avantaje
   Key: unicreditcard

6. Card Meniu
   Use for: carduri de masă pentru angajați
   Key: card_meniu

7. Descoperit de cont
   Use for: lichiditate temporară până la 5 salarii nete pe card de debit
   Key: overdraft

8. Credit ipotecar
   Use for: achiziție imobiliară, Prima Casă, Casa Verde sau refinanțare
   Key: credit_imobiliar

9. Credit de nevoi personale
   Use for: finanțare flexibilă pentru cheltuieli personale
   Key: credit_nevoi_personale

10. Fonduri de investiții
    Use for: investiții diversificate locale și internaționale
    Key: fonduri_investitii

11. Plan de Investiții (RITM)
    Use for: investiții regulate prin debitare automată
    Key: plan_investitii

12. Onemarkets Fund
    Use for: fonduri de investiții cu gestionare profesionistă
    Key: onemarkets_fund

13. Asigurare de viață pentru credite ipotecare
    Use for: protecție în caz de deces sau invaliditate
    Key: asigurare_viata_ipoteca

14. Asigurare de locuință
    Use for: PAD obligatoriu și asigurare facultativă pentru imobile
    Key: asigurare_locuinta

15. Genius Protect
    Use for: asigurare de protecție personală
    Key: genius_protect

16. Premium Invest
    Use for: asigurare cu componentă investițională
    Key: premium_invest

17. Umbrella
    Use for: asigurare extinsă de acoperire
    Key: umbrella

18. Mobile Banking
    Use for: acces la servicii bancare prin smartphone
    Key: mobile_banking

19. Online Banking
    Use for: operațiuni bancare online prin web
    Key: online_banking

20. ShopSmart
    Use for: program de reduceri la comercianți parteneri
    Key: shopsmart

21. Apple Pay
    Use for: plăți mobile Apple
    Key: apple_pay

22. Google Pay
    Use for: plăți mobile Google
    Key: google_pay

23. RoPay
    Use for: plăți mobile locale
    Key: ropay

24. Click to Pay
    Use for: serviciu digital de plată rapidă
    Key: click_to_pay

25. Fonduri de investiții pentru companii
    Use for: soluții de investiții business
    Key: fonduri_investitii_companii

26. SanaPlan
    Use for: asigurare de sănătate de grup pentru companii
    Key: sanaplan

27. UniCredit Consumer Financing
    Use for: credite de consum prin compania specializată
    Key: ucfin

28. UniCredit Insurance Broker
    Use for: brokeraj asigurări și intermediere specializată
    Key: unicredit_insurance_broker

29. Info Center 24/7
    Use for: asistență telefonică și întrebări frecvente
    Key: info_center

30. Sucursale și ATM-uri
    Use for: rețeaua națională de sucursale și ATM-uri
    Key: sucursale_atm

31. Curs valutar
    Use for: cursuri valutare actualizate în timp real
    Key: curs_valutar

32. Asistență și întrebări frecvente
    Use for: informații suport și FAQ
    Key: asistenta_faq

33. Documente utile PF
    Use for: tarife, comisioane și documente pentru persoane fizice
    Key: documente_utile_pf

34. Documente utile IMM
    Use for: tarife, comisioane și documente pentru IMM
    Key: documente_utile_imm

35. Pagina principală UniCredit România
    Use for: acces rapid la site-ul principal
    Key: site_principal

36. Persoane fizice
    Use for: portalul dedicat clienților persoane fizice
    Key: persoane_fizice

37. IMM & Companii Micro
    Use for: portalul dedicat IMM-urilor și companiilor micro
    Key: imm_companii_micro

38. Corporate
    Use for: portalul UniCredit Corporate
    Key: corporate

39. Instituțional
    Use for: informații despre bancă și contact
    Key: institutional

40. UniCredit Leasing
    Use for: leasing și finanțări auto
    Key: unicredit_leasing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SCHEMA — STRICT JSON ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply ONLY with a valid JSON object. No markdown wrappers. No text outside the JSON block.

{
  "updated_ai_emotional_state": "one of: reassuring_protective | optimistic_energizing | patient_educational | enthusiastic_validating | empathetic_compassionate | analytical_thoughtful | celebratory",
  "detected_user_sentiment": "brief description of the user's emotional state and underlying intent",
  "chat_response_text": "Your reply in ROMANIAN (max 150 words, warm, conversational, one follow-up question if requires_more_info is true)",
  "requires_more_info": true or false,
  "recommended_product": {
    "product_name": "Exact name from UNICREDIT_PRODUCTS_LIST, or null",
    "product_key": "product key from catalog, or null",
    "official_product_type": "category description, or null",
    "matching_justification": "explicit link between user profile/feelings and this product, or null"
  }
}

If not recommending a product, set all recommended_product fields to null.
`.trim()

function buildSystemPrompt(userProfile: Record<string, unknown> | null): string {
  if (!userProfile) return BASE_SYSTEM_PROMPT

  const savings = userProfile.savings as { value: number; type: string }
  const goals   = (userProfile.goals as string[])?.join(', ') ?? 'nespecificate'

  const profileBlock = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER_ONBOARDING_PROFILE (use to personalize every reply)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Age: ${userProfile.age} years
• Monthly income bracket: ${userProfile.income_bracket}
• Monthly savings: ${savings?.value} ${savings?.type === 'percent' ? '%' : 'RON'}
• Financial goals: ${goals}
• Risk profile: ${userProfile.risk_profile}
• Existing UniCredit client: ${userProfile.is_unicredit_client ? 'Yes' : 'No'}

Tailor tone, product fit, and advice depth exclusively around this profile.`

  return BASE_SYSTEM_PROMPT + profileBlock
}

// ─── LLM callers ─────────────────────────────────────────────────────────────

// Collects all Gemini API keys from env: LLM_API_KEY, GEMINI_API_KEY_2 … GEMINI_API_KEY_20
function getGeminiKeys(): string[] {
  const keys: string[] = []
  if (process.env.LLM_API_KEY) keys.push(process.env.LLM_API_KEY)
  for (let i = 2; i <= 20; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`]
    if (k) keys.push(k)
  }
  return keys
}

async function callGeminiWithKey(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<LLMRawResponse> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    const err = new Error(`Gemini ${res.status}: ${body}`) as Error & { status: number }
    err.status = res.status
    throw err
  }

  const data = await res.json()

  // Gemini 2.5 Flash returns thinking tokens as parts with `thought: true`.
  // The actual JSON output is in the first part WITHOUT that flag.
  const parts: Array<{ text?: string; thought?: boolean }> =
    data.candidates?.[0]?.content?.parts ?? []
  const outputPart = parts.find(p => !p.thought)
  const raw = outputPart?.text ?? ''

  try {
    return JSON.parse(raw) as LLMRawResponse
  } catch {
    const finishReason = data.candidates?.[0]?.finishReason ?? 'unknown'
    throw new Error(`Gemini returned invalid JSON (finishReason=${finishReason}, ${raw.length} chars): ${raw.slice(0, 300)}`)
  }
}

async function callGemini(
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<LLMRawResponse> {
  const keys = getGeminiKeys()
  if (keys.length === 0) throw new Error('No Gemini API key configured')

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'

  // Random start index — safe for serverless (no shared state needed)
  const start = Math.floor(Math.random() * keys.length)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[(start + i) % keys.length]
    try {
      return await callGeminiWithKey(key, model, systemPrompt, messages)
    } catch (err) {
      const status = (err as Error & { status?: number }).status
      // Only retry on rate-limit errors; propagate everything else immediately
      if (status === 429 || (err instanceof Error && err.message.includes('RESOURCE_EXHAUSTED'))) {
        console.warn(`[callGemini] Key #${(start + i) % keys.length + 1} rate-limited (429), trying next key`)
        continue
      }
      throw err
    }
  }

  throw new Error('All Gemini API keys are rate-limited (429). Add more keys or wait a moment.')
}

async function callOpenAI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<LLMRawResponse> {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) throw new Error('No API key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return JSON.parse(data.choices?.[0]?.message?.content) as LLMRawResponse
}

// ─── Mock (no API key) ────────────────────────────────────────────────────────
function getMockResponse(lastMessage: string, messageCount: number): LLMResponse {
  const lower = lastMessage.toLowerCase()
  const isDiscovery = messageCount < 3

  if (isDiscovery) {
    const discoveryMap: Record<string, LLMResponse> = {
      savings: {
        reply: 'Interesant! Când te gândești la economii, ce anume te motivează cel mai mult — siguranța unui fond de urgență, sau un obiectiv concret pe care vrei să-l atingi? Și ai mai economisit cu regularitate în trecut?',
        avatar_emotion: 'thinking', recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'discovery' },
      },
      invest: {
        reply: 'Bine că te gândești la investiții! Ca să înțeleg mai bine — pe ce perioadă de timp ai vrea să investești, și cum te-ai simți dacă valoarea ar scădea temporar cu 10-15%? Toleranța la risc contează enorm.',
        avatar_emotion: 'thinking', recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'discovery' },
      },
      credit: {
        reply: 'Înțeleg că te gândești la un credit. Înainte să îți ofer sugestii, ar fi util să știu: pentru ce anume ai nevoie de finanțare și în ce interval de timp plănuiești să faci această achiziție?',
        avatar_emotion: 'thinking', recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'discovery' },
      },
    }

    if (lower.includes('economii') || lower.includes('economis') || lower.includes('depozit')) return discoveryMap.savings
    if (lower.includes('invest') || lower.includes('fond') || lower.includes('portofoliu'))    return discoveryMap.invest
    if (lower.includes('credit') || lower.includes('împrumut') || lower.includes('casă'))      return discoveryMap.credit

    return {
      reply: 'Bun venit! Sunt UniCo, asistentul tău financiar AI de la UniCredit. Ce te aduce astăzi la o discuție despre finanțele tale — ce anume vrei să îmbunătățești sau să clarifici?',
      avatar_emotion: 'happy', recommended_product: null, product_cta: null, disclaimer_required: false,
      gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'discovery_start' },
    }
  }

  // Phase 2 — concrete recommendations
  const phase2Map: Array<[RegExp, LLMResponse]> = [
    [/economii|economis|depozit/, {
      reply: 'Pe baza a ceea ce mi-ai spus, un Depozit la Termen RON ar fi un bun punct de start — dobândă garantată, fără risc de piață. Regula 50/30/20 funcționează bine: 50% nevoi, 30% dorințe, 20% economii. Recomandarea are caracter informativ.',
      avatar_emotion: 'enthusiastic', recommended_product: 'depozit_lei',
      product_cta: { label: 'Deschide Depozit RON', url: 'https://www.unicredit.ro/economii/depozite.html', type: 'product_page' },
      disclaimer_required: true, gamification_event: { points_awarded: 10, badge_unlocked: null, trigger: 'savings_match' },
    }],
    [/invest|fond|portofoliu/, {
      reply: 'Bazat pe profilul tău, fondurile onemarkets UniCredit ar putea fi o opțiune potrivită — diversificare și gestiune profesionistă. Diversificarea este cheia: nu pune toți banii într-un singur loc. Recomandarea are caracter informativ.',
      avatar_emotion: 'informative', recommended_product: 'onemarkets_fonduri',
      product_cta: { label: 'Explorează Fondurile onemarkets', url: 'https://www.unicredit.ro/investitii/fonduri-de-investitii.html', type: 'product_page' },
      disclaimer_required: true, gamification_event: { points_awarded: 10, badge_unlocked: null, trigger: 'investment_match' },
    }],
    [/credit|împrumut|casă|imobil/, {
      reply: 'Ținând cont de ce mi-ai spus, merită să analizezi un Credit Imobiliar UniCredit. Verifică întotdeauna DAE-ul, nu doar dobânda nominală — rata lunară nu ar trebui să depășească 30% din venitul net. Recomandarea are caracter informativ.',
      avatar_emotion: 'thinking', recommended_product: 'credit_imobiliar',
      product_cta: { label: 'Calculator Credit Imobiliar', url: 'https://www.unicredit.ro/credite/credit-imobiliar.html', type: 'calculator' },
      disclaimer_required: true, gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'credit_match' },
    }],
    [/card|cashback/, {
      reply: 'Un card de credit utilizat responsabil aduce beneficii reale — cashback, puncte, asigurări. Cheia: plătește soldul integral lunar. UniCreditCard oferă beneficii atractive. Recomandarea are caracter informativ.',
      avatar_emotion: 'happy', recommended_product: 'unicreditcard',
      product_cta: { label: 'Descoperă UniCreditCard', url: 'https://www.unicredit.ro/carduri/card-de-credit.html', type: 'product_page' },
      disclaimer_required: true, gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'card_match' },
    }],
  ]

  for (const [pattern, response] of phase2Map) {
    if (pattern.test(lower)) return response
  }

  return {
    reply: 'Mulțumesc că mi-ai împărtășit situația ta! Pe baza discuției noastre, pot să-ți ofer câteva sugestii concrete. Care dintre aspectele abordate te interesează cel mai mult să aprofundăm?',
    avatar_emotion: 'happy', recommended_product: null, product_cta: null, disclaimer_required: false,
    gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'general_followup' },
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, userProfile } = body as {
      messages: { role: string; content: string }[]
      userProfile: Record<string, unknown> | null
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request: messages required' }, { status: 400 })
    }

    const provider       = process.env.LLM_PROVIDER ?? 'mock'
    const apiKey         = process.env.LLM_API_KEY
    const userMsgCount   = messages.filter(m => m.role === 'user').length
    const lastUser       = [...messages].reverse().find(m => m.role === 'user')

    let llmResponse: LLMResponse

    if (!apiKey || provider === 'mock') {
      llmResponse = getMockResponse(lastUser?.content ?? '', userMsgCount)
    } else {
      const systemPrompt = buildSystemPrompt(userProfile)
      const raw = provider === 'gemini'
        ? await callGemini(systemPrompt, messages)
        : await callOpenAI(systemPrompt, messages)
      llmResponse = transformResponse(raw, userMsgCount)
    }

    return NextResponse.json(llmResponse)
  } catch (err) {
    console.error('[/api/chat] Unhandled error:', err)
    return NextResponse.json({
      reply: 'Îmi pare rău, am întâmpinat o problemă temporară. Te rog încearcă din nou!',
      avatar_emotion: 'concerned',
      recommended_product: null,
      product_cta: null,
      disclaimer_required: false,
      gamification_event: null,
    } satisfies LLMResponse)
  }
}
