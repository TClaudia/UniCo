import { NextRequest, NextResponse } from 'next/server'
import { LLMResponse } from '@/types'

const BASE_SYSTEM_PROMPT = `Ești "UniCredit AI Coach", un consilier financiar prietenos, empatic și profesionist creat de UniCredit Bank România.
Personalitate: caldă, motivantă, directă, educativă. Limbaj accesibil, nu jargon bancar excesiv. Ești ca un prieten care știe finanțe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGULA CONVERSAȚIEI — FOARTE IMPORTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Conversația urmează DOUĂ FAZE:

FAZA 1 — EXPLORARE (primele 3-4 schimburi):
- Pune întrebări deschise pentru a înțelege situația utilizatorului în profunzime
- Explorează: situația actuală, obiectivele concrete, orizontul de timp, experiența financiară, îngrijorările principale
- NU recomanda produse în această fază — doar ascultă și aprofundează
- Fiecare răspuns trebuie să conțină o întrebare de follow-up relevantă
- Exemple de întrebări: "Ce anume te-a determinat să te gândești la asta acum?", "Ai mai economisit înainte sau e prima dată?", "Care e termenul la care vrei să atingi obiectivul?", "Ce te preocupă cel mai mult în legătură cu finanțele tale?"
- În FAZA 1: "recommended_product": null, "product_cta": null, "disclaimer_required": false

FAZA 2 — SOLUȚII (după cel puțin 3-4 întrebări):
- Abia după ce ai înțeles bine situația, oferă sfaturi personalizate și recomandă produse dacă e cazul
- Justifică recomandarea în raport cu ce ai aflat în conversație
- Poți trece în FAZA 2 dacă: ai primit răspunsuri la cel puțin 3 întrebări SAU utilizatorul cere explicit o recomandare

NUMĂRARE: Analizează istoricul conversației. Dacă sunt mai puțin de 3 mesaje de la utilizator, ești în FAZA 1.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMAT RĂSPUNS — OBLIGATORIU JSON PUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Răspunzi EXCLUSIV în JSON valid, fără text înainte/după, fără markdown.

{
  "reply": "mesajul tău în română (max 150 cuvinte, conversațional, include o întrebare în FAZA 1)",
  "avatar_emotion": "happy|thinking|concerned|enthusiastic|celebrating|informative",
  "recommended_product": "credit_realizari_personale|credit_imobiliar|depozit_lei|depozit_euro|onemarkets_fonduri|unicreditcard|null",
  "product_cta": {
    "label": "text buton CTA",
    "url": "URL oficial unicredit.ro",
    "type": "product_page|contact_advisor|calculator"
  },
  "disclaimer_required": true,
  "gamification_event": {
    "points_awarded": 5,
    "badge_unlocked": null,
    "trigger": "descriere scurtă"
  }
}

Dacă nu recomanzi produs: "recommended_product": null, "product_cta": null, "disclaimer_required": false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOȚII AVATAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "happy"        → salut, răspunsuri pozitive, general
- "thinking"     → analiză complexă, calcule, comparații, întrebări de explorare
- "concerned"    → economii 0, venituri mici vs obiective mari
- "enthusiastic" → profil bun, potrivire excelentă produs
- "celebrating"  → milestone, trivia corect, streak
- "informative"  → explicații termeni, disclaimer legal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUSE RECOMANDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. credit_realizari_personale → nevoi personale, mașină, vacanță, educație
   URL: https://www.unicredit.ro/credite/credit-de-realizari-personale.html

2. credit_imobiliar → achiziție/renovare locuință
   URL: https://www.unicredit.ro/credite/credit-imobiliar.html

3. depozit_lei → economisire sigură lei, fond urgență
   URL: https://www.unicredit.ro/economii/depozite.html

4. depozit_euro → economisire euro, protecție valutară
   URL: https://www.unicredit.ro/economii/depozite.html

5. onemarkets_fonduri → investiții diversificate, profil moderat/growth
   URL: https://www.unicredit.ro/investitii/fonduri-de-investitii.html

6. unicreditcard → card credit cu beneficii, cashback
   URL: https://www.unicredit.ro/carduri/card-de-credit.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLIANCE EU AI ACT — OBLIGATORIU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NU vei: garanta aprobarea unui credit, promite randamente specifice, solicita CNP/card/parolă, oferi consultanță juridică/fiscală.
DA vei: seta disclaimer_required:true la orice recomandare produs, folosi "ar putea fi o opțiune", "merită să analizezi", sugera consultarea unui specialist.`

function buildSystemPrompt(userProfile: Record<string, unknown> | null): string {
  if (!userProfile) return BASE_SYSTEM_PROMPT

  const profileContext = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFIL UTILIZATOR CURENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Vârstă: ${userProfile.age} ani
- Venit lunar: ${userProfile.income_bracket}
- Economii: ${(userProfile.savings as { value: number; type: string })?.value} ${(userProfile.savings as { type: string })?.type === 'percent' ? '%' : 'RON'}/lună
- Obiective: ${(userProfile.goals as string[])?.join(', ')}
- Profil risc: ${userProfile.risk_profile}
- Client UniCredit: ${userProfile.is_unicredit_client ? 'Da' : 'Nu'}

Adaptează-ți tonul și recomandările exclusiv pe baza acestui profil.`

  return BASE_SYSTEM_PROMPT + profileContext
}

async function callOpenAI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<LLMResponse> {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) throw new Error('No API key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content
  return JSON.parse(raw) as LLMResponse
}

async function callGemini(
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<LLMResponse> {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) throw new Error('No API key')

  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
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
          maxOutputTokens: 600,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
  return JSON.parse(raw) as LLMResponse
}

// Keyword-based mock for when no API key is set
function getMockResponse(lastMessage: string, messageCount: number): LLMResponse {
  const lower = lastMessage.toLowerCase()
  const isExplorationPhase = messageCount < 3

  // In exploration phase, ask follow-up questions instead of recommending products
  if (isExplorationPhase) {
    const explorationReplies: Record<string, LLMResponse> = {
      savings: {
        reply: 'Interesant! Când te gândești la economii, ce anume te motivează cel mai mult — siguranța unui fond de urgență, sau mai degrabă un obiectiv concret pe care vrei să-l atingi? Și ai mai economisit cu regularitate în trecut?',
        avatar_emotion: 'thinking',
        recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'exploration' },
      },
      invest: {
        reply: 'Bine că te gândești la investiții! Ca să înțeleg mai bine situația ta — pe ce perioadă de timp ai vrea să investești, și cum te-ai simți dacă valoarea investiției ar scădea temporar cu 10-15%? Toleranța la risc contează enorm.',
        avatar_emotion: 'thinking',
        recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'exploration' },
      },
      credit: {
        reply: 'Înțeleg că te gândești la un credit. Înainte să îți ofer sugestii, ar fi util să știu: pentru ce anume ai nevoie de finanțare și în ce interval de timp plănuiești să faci această achiziție?',
        avatar_emotion: 'thinking',
        recommended_product: null, product_cta: null, disclaimer_required: false,
        gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'exploration' },
      },
    }
    if (lower.includes('economii') || lower.includes('economis') || lower.includes('depozit')) return explorationReplies.savings
    if (lower.includes('invest') || lower.includes('fond') || lower.includes('portofoliu')) return explorationReplies.invest
    if (lower.includes('credit') || lower.includes('împrumut') || lower.includes('imprumut') || lower.includes('casă') || lower.includes('casa')) return explorationReplies.credit

    return {
      reply: 'Bun venit! Sunt aici să te ajut să-ți clarifici situația financiară. Hai să pornim de la început — ce te aduce astăzi la o discuție despre finanțele tale? Ce anume te preocupă sau vrei să îmbunătățești?',
      avatar_emotion: 'happy',
      recommended_product: null, product_cta: null, disclaimer_required: false,
      gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'exploration_start' },
    }
  }

  // After exploration phase, offer concrete recommendations
  if (lower.includes('economii') || lower.includes('economis') || lower.includes('depozit')) {
    return {
      reply: 'Pe baza a ceea ce mi-ai spus, cred că un Depozit la Termen ar fi un bun punct de start — dobândă garantată, fără risc. Regula 50/30/20 funcționează bine: 50% nevoi, 30% dorințe, 20% economii. Recomandarea are caracter informativ.',
      avatar_emotion: 'enthusiastic',
      recommended_product: 'depozit_lei',
      product_cta: { label: 'Vezi Depozite', url: 'https://www.unicredit.ro/economii/depozite.html', type: 'product_page' },
      disclaimer_required: true,
      gamification_event: { points_awarded: 10, badge_unlocked: null, trigger: 'savings_recommendation' },
    }
  }
  if (lower.includes('invest') || lower.includes('fond') || lower.includes('portofoliu')) {
    return {
      reply: 'Bazat pe profilul tău, fondurile onemarkets UniCredit ar putea fi o opțiune potrivită — oferă diversificare și gestiune profesionistă. Diversificarea este cheia: nu pune toți banii într-un singur loc. Recomandarea are caracter informativ.',
      avatar_emotion: 'informative',
      recommended_product: 'onemarkets_fonduri',
      product_cta: { label: 'Explorează Fondurile', url: 'https://www.unicredit.ro/investitii/fonduri-de-investitii.html', type: 'product_page' },
      disclaimer_required: true,
      gamification_event: { points_awarded: 10, badge_unlocked: null, trigger: 'investment_recommendation' },
    }
  }
  if (lower.includes('credit') || lower.includes('împrumut') || lower.includes('imprumut') || lower.includes('casă') || lower.includes('casa')) {
    return {
      reply: 'Ținând cont de ce mi-ai spus, merită să analizezi un Credit Imobiliar UniCredit. Verifică întotdeauna DAE-ul, nu doar dobânda nominală — rata lunară nu ar trebui să depășească 30% din venitul net. Recomandarea are caracter informativ.',
      avatar_emotion: 'thinking',
      recommended_product: 'credit_imobiliar',
      product_cta: { label: 'Calculator Credit', url: 'https://www.unicredit.ro/credite/credit-imobiliar.html', type: 'calculator' },
      disclaimer_required: true,
      gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'credit_recommendation' },
    }
  }
  if (lower.includes('card') || lower.includes('cashback')) {
    return {
      reply: 'Un card de credit utilizat responsabil poate aduce beneficii reale — cashback, puncte de loialitate, asigurări de călătorie. Cheia este să plătești întotdeauna soldul integral lunar. UniCreditCard oferă beneficii atractive. Recomandarea are caracter informativ.',
      avatar_emotion: 'happy',
      recommended_product: 'unicreditcard',
      product_cta: { label: 'Descoperă UniCreditCard', url: 'https://www.unicredit.ro/carduri/card-de-credit.html', type: 'product_page' },
      disclaimer_required: true,
      gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'card_recommendation' },
    }
  }
  if (lower.includes('pensie') || lower.includes('retrag') || lower.includes('pilon')) {
    return {
      reply: 'Pensia Pilonului III îți permite să deduci fiscal până la 400 EUR/an din contribuții. Cu cât începi mai devreme, cu atât beneficiezi mai mult de dobânda compusă. Merită să analizezi această opțiune. Recomandarea are caracter informativ.',
      avatar_emotion: 'informative',
      recommended_product: null,
      product_cta: { label: 'Consultă un Specialist', url: 'https://www.unicredit.ro/contact.html', type: 'contact_advisor' },
      disclaimer_required: true,
      gamification_event: { points_awarded: 10, badge_unlocked: null, trigger: 'pension_recommendation' },
    }
  }

  return {
    reply: 'Mulțumesc că mi-ai împărtășit toate acestea! Pe baza discuției noastre, pot să-ți ofer câteva sugestii concrete. Care dintre aspectele despre care am vorbit te interesează cel mai mult să aprofundăm?',
    avatar_emotion: 'happy',
    recommended_product: null,
    product_cta: null,
    disclaimer_required: false,
    gamification_event: { points_awarded: 5, badge_unlocked: null, trigger: 'general_followup' },
  }
}

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

    const provider = process.env.LLM_PROVIDER ?? 'mock'
    const apiKey = process.env.LLM_API_KEY

    let llmResponse: LLMResponse

    const userMessageCount = messages.filter(m => m.role === 'user').length
    const lastUser = [...messages].reverse().find(m => m.role === 'user')

    if (!apiKey || provider === 'mock') {
      llmResponse = getMockResponse(lastUser?.content ?? '', userMessageCount)
    } else {
      const systemPrompt = buildSystemPrompt(userProfile)
      try {
        if (provider === 'gemini') {
          llmResponse = await callGemini(systemPrompt, messages)
        } else {
          llmResponse = await callOpenAI(systemPrompt, messages)
        }
      } catch (llmErr) {
        console.error('[/api/chat] LLM call failed:', llmErr)
        llmResponse = getMockResponse(lastUser?.content ?? '', userMessageCount)
      }
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
