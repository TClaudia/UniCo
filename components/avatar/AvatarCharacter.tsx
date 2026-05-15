'use client'

import { useEffect, useState, useRef, useId } from 'react'

// ─── Configuration types & constants ────────────────────────────────────────

export const SKIN_TONES = [
  { id: 'light',  color: '#FDDBB4', name: 'Deschis'  },
  { id: 'medium', color: '#D4956A', name: 'Mediu'    },
  { id: 'tan',    color: '#C07B4E', name: 'Bronzat'  },
  { id: 'dark',   color: '#7D4E2A', name: 'Închis'   },
  { id: 'deep',   color: '#4A2810', name: 'Profund'  },
] as const

export const HAIR_STYLES = [
  { id: 'short',  name: 'Scurt' },
  { id: 'medium', name: 'Mediu' },
  { id: 'long',   name: 'Lung'  },
  { id: 'curly',  name: 'Creț'  },
  { id: 'bun',    name: 'Coc'   },
] as const

export const HAIR_COLORS = [
  { id: 'black',  color: '#1C1C1C', name: 'Negru'    },
  { id: 'brown',  color: '#6B3D1E', name: 'Castaniu' },
  { id: 'blonde', color: '#C8973A', name: 'Blond'    },
  { id: 'red',    color: '#9C2E1A', name: 'Roșcat'   },
  { id: 'gray',   color: '#7A7A7A', name: 'Gri'      },
  { id: 'white',  color: '#D8D8D8', name: 'Alb'      },
] as const

export const EYE_COLORS = [
  { id: 'brown', color: '#6B4226', name: 'Căprui'       },
  { id: 'blue',  color: '#3A7BD5', name: 'Albaștri'    },
  { id: 'green', color: '#2E8B57', name: 'Verzi'        },
  { id: 'hazel', color: '#8B7355', name: 'Căprui-verzi' },
] as const

export const OUTFITS = [
  { id: 'suit',     name: 'Costum'       },
  { id: 'smart',    name: 'Smart Casual' },
  { id: 'business', name: 'Business'     },
] as const

export const ACCESSORIES = [
  { id: 'none',     name: 'Niciunul' },
  { id: 'glasses',  name: 'Ochelari' },
  { id: 'earrings', name: 'Cercei'   },
  { id: 'tie',      name: 'Cravată'  },
] as const

export type SkinToneId  = typeof SKIN_TONES[number]['id']
export type HairStyleId = typeof HAIR_STYLES[number]['id']
export type HairColorId = typeof HAIR_COLORS[number]['id']
export type EyeColorId  = typeof EYE_COLORS[number]['id']
export type OutfitId    = typeof OUTFITS[number]['id']
export type AccessoryId = typeof ACCESSORIES[number]['id']

export interface AvatarConfig {
  skinTone:  SkinToneId
  hairStyle: HairStyleId
  hairColor: HairColorId
  eyeColor:  EyeColorId
  outfit:    OutfitId
  accessory: AccessoryId
  name: string
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: 'medium', hairStyle: 'medium', hairColor: 'black',
  eyeColor: 'brown', outfit: 'suit', accessory: 'glasses', name: 'Alex',
}

export type CharacterEmotion =
  | 'idle' | 'listening' | 'thinking' | 'typing'
  | 'idea' | 'happy' | 'empathetic' | 'alert'

export const EMOTIONS: Record<CharacterEmotion, { label: string; color: string }> = {
  idle:       { label: 'Inactiv',  color: '#9B9A96' },
  listening:  { label: 'Ascultă',  color: '#3A7BD5' },
  thinking:   { label: 'Gândește', color: '#7B5EA7' },
  typing:     { label: 'Scrie',    color: '#2E8B57' },
  idea:       { label: 'Idee!',    color: '#D4AA50' },
  happy:      { label: 'Bucuros',  color: '#E30613' },
  empathetic: { label: 'Empatic',  color: '#5BBCD6' },
  alert:      { label: 'Alertă',   color: '#FF6B35' },
}

// ─── Core SVG character (head + torso, no background circle) ─────────────────

function AvatarSVG({ config, emotion, blinkPhase, breathPhase, uid }: {
  config:      AvatarConfig
  emotion:     CharacterEmotion
  blinkPhase:  number
  breathPhase: number
  uid:         string
}) {
  const skin      = SKIN_TONES.find(s => s.id === config.skinTone)?.color  ?? '#FDDBB4'
  const hairColor = HAIR_COLORS.find(h => h.id === config.hairColor)?.color ?? '#1A1A1A'
  const eyeColor  = EYE_COLORS.find(e => e.id === config.eyeColor)?.color   ?? '#6B4226'
  const breathY   = Math.sin(breathPhase) * 1.5
  const isBlinking = blinkPhase > 0.85

  const gradId   = `av-sg-${uid}`
  const filterId = `av-sf-${uid}`
  const clipId   = `av-sc-${uid}`

  const getEyebrows = () => {
    if (emotion === 'thinking')   return { leftY: 72, rightY: 68, worried: false, stern: false }
    if (emotion === 'empathetic') return { leftY: 70, rightY: 70, worried: true,  stern: false }
    if (emotion === 'alert')      return { leftY: 68, rightY: 68, worried: false, stern: true  }
    if (emotion === 'happy' || emotion === 'idea')
                                  return { leftY: 73, rightY: 73, worried: false, stern: false }
    return { leftY: 72, rightY: 72, worried: false, stern: false }
  }

  const getMouth = () => {
    if (emotion === 'happy' || emotion === 'idea') return 'smile'
    if (emotion === 'empathetic') return 'gentle'
    if (emotion === 'alert')      return 'firm'
    if (emotion === 'thinking')   return 'neutral-think'
    return 'neutral'
  }

  const getGaze = () => {
    if (emotion === 'thinking') return { dx: 4, dy: -3 }
    if (emotion === 'typing')   return { dx: -5, dy: 6 }
    if (emotion === 'idea')     return { dx: 0,  dy: -2 }
    return { dx: 0, dy: 0 }
  }

  const brows = getEyebrows()
  const mouth = getMouth()
  const gaze  = getGaze()

  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="40" y="55" width="120" height="130" />
        </clipPath>
        <radialGradient id={gradId} cx="45%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={skin} stopOpacity="1"    />
          <stop offset="100%" stopColor={skin} stopOpacity="0.85" />
        </radialGradient>
        <filter id={filterId}>
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      <g transform={`translate(0,${breathY})`}>

        {/* Outfit */}
        {config.outfit === 'suit' && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill="#1A1A2E" />
            <rect x="35"  y="195" width="130" height="70" rx="12" fill="#1A1A2E" />
            <rect x="88"  y="175" width="24"  height="55" rx="2"  fill="#FFF"    opacity="0.12" />
            <rect x="93"  y="175" width="14"  height="55" rx="1"  fill="#E30613" opacity="0.82" />
            <rect x="35"  y="195" width="30"  height="55" rx="8"  fill="#12182B" />
            <rect x="135" y="195" width="30"  height="55" rx="8"  fill="#12182B" />
            <rect x="82"  y="175" width="36"  height="8"  rx="2"  fill="#F0EFED" />
          </g>
        )}
        {config.outfit === 'smart' && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill="#4A5568" />
            <rect x="35"  y="195" width="130" height="70" rx="12" fill="#4A5568" />
            <rect x="35"  y="195" width="30"  height="55" rx="8"  fill="#3A4556" />
            <rect x="135" y="195" width="30"  height="55" rx="8"  fill="#3A4556" />
            <rect x="80"  y="175" width="40"  height="8"  rx="2"  fill="#E2E0DC" />
          </g>
        )}
        {config.outfit === 'business' && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill="#E30613" opacity="0.85" />
            <rect x="35"  y="195" width="130" height="70" rx="12" fill="#E30613" opacity="0.85" />
            <rect x="35"  y="195" width="30"  height="55" rx="8"  fill="#B80510" opacity="0.9" />
            <rect x="135" y="195" width="30"  height="55" rx="8"  fill="#B80510" opacity="0.9" />
            <rect x="80"  y="175" width="40"  height="8"  rx="2"  fill="#FFF"    opacity="0.3" />
          </g>
        )}

        {/* Neck */}
        <rect x="86" y="162" width="28" height="22" rx="8" fill={skin} />

        {/* Head */}
        <g filter={`url(#${filterId})`}>
          <ellipse cx="100" cy="115" rx="54" ry="62" fill={`url(#${gradId})`} />
        </g>

        {/* Hair back */}
        {config.hairStyle === 'long' && (
          <ellipse cx="100" cy="100" rx="60" ry="72" fill={hairColor} clipPath={`url(#${clipId})`} />
        )}
        {config.hairStyle === 'curly' && (
          [60,72,84,96,108,120,132,144].map((x, i) => (
            <circle key={i} cx={x} cy={52 + (i % 2) * 6} r={10} fill={hairColor} opacity="0.9" />
          ))
        )}

        {/* Ears */}
        <ellipse cx="46"  cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="154" cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="46"  cy="118" rx="5" ry="7"  fill={skin} opacity="0.6" />
        <ellipse cx="154" cy="118" rx="5" ry="7"  fill={skin} opacity="0.6" />

        {config.accessory === 'earrings' && (
          <>
            <circle cx="46"  cy="128" r="4" fill="#D4AA50" />
            <circle cx="154" cy="128" r="4" fill="#D4AA50" />
          </>
        )}

        {/* Hair front */}
        {config.hairStyle === 'short' && (
          <ellipse cx="100" cy="72" rx="52" ry="28" fill={hairColor} />
        )}
        {config.hairStyle === 'medium' && (
          <g>
            <ellipse cx="100" cy="70" rx="52" ry="26" fill={hairColor} />
            <rect x="48"  y="75" width="16" height="30" rx="8" fill={hairColor} />
            <rect x="136" y="75" width="16" height="30" rx="8" fill={hairColor} />
          </g>
        )}
        {config.hairStyle === 'long' && (
          <g>
            <ellipse cx="100" cy="70" rx="52" ry="26" fill={hairColor} />
            <rect x="46"  y="75" width="16" height="70" rx="8" fill={hairColor} />
            <rect x="138" y="75" width="16" height="70" rx="8" fill={hairColor} />
          </g>
        )}
        {config.hairStyle === 'curly' && (
          <ellipse cx="100" cy="65" rx="56" ry="32" fill={hairColor} />
        )}
        {config.hairStyle === 'bun' && (
          <g>
            <ellipse cx="100" cy="75" rx="50" ry="22" fill={hairColor} />
            <circle  cx="100" cy="56" r="16"           fill={hairColor} />
          </g>
        )}

        {/* Forehead highlight */}
        <ellipse cx="100" cy="95" rx="20" ry="12" fill="#FFF" opacity="0.07" />

        {/* Eyebrows */}
        <g stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none">
          {brows.worried ? (
            <>
              <path d={`M 70 ${brows.leftY}  Q 80 ${brows.leftY  - 5} 90 ${brows.leftY}`} />
              <path d={`M 110 ${brows.rightY} Q 120 ${brows.rightY - 5} 130 ${brows.rightY}`} />
            </>
          ) : brows.stern ? (
            <>
              <line x1="68"  y1={brows.leftY  + 3} x2="90"  y2={brows.leftY  - 3} />
              <line x1="110" y1={brows.rightY - 3} x2="132" y2={brows.rightY + 3} />
            </>
          ) : (
            <>
              <path d={`M 70 ${brows.leftY}  Q 80 ${brows.leftY  - 4} 90 ${brows.leftY}`} />
              <path d={`M 110 ${brows.rightY} Q 120 ${brows.rightY - 4} 130 ${brows.rightY}`} />
            </>
          )}
        </g>

        {/* Eyes */}
        <g transform={`translate(${gaze.dx},${gaze.dy})`}>
          {/* Left eye */}
          <ellipse cx="80" cy="108" rx="11"
            ry={isBlinking ? 1.5 : (emotion === 'idea' ? 10 : 8)} fill="#FFF" />
          {!isBlinking && <ellipse cx="80" cy="108" rx="6" ry="6" fill={eyeColor} />}
          {!isBlinking && <circle  cx="80" cy="108" r="3.5"       fill="#1A1A1A" />}
          {!isBlinking && <circle  cx="82" cy="106" r="1.5"       fill="#FFF"    />}
          {emotion === 'idea' && !isBlinking && (
            <>
              <circle cx="73" cy="100" r="3" fill="#FFE066" opacity="0.9" />
              <circle cx="90" cy="99"  r="2" fill="#FFE066" opacity="0.7" />
            </>
          )}

          {/* Right eye */}
          <ellipse cx="120" cy="108" rx="11"
            ry={isBlinking ? 1.5 : (emotion === 'idea' ? 10 : 8)} fill="#FFF" />
          {!isBlinking && <ellipse cx="120" cy="108" rx="6" ry="6" fill={eyeColor} />}
          {!isBlinking && <circle  cx="120" cy="108" r="3.5"       fill="#1A1A1A" />}
          {!isBlinking && <circle  cx="122" cy="106" r="1.5"       fill="#FFF"    />}
          {emotion === 'idea' && !isBlinking && (
            <>
              <circle cx="113" cy="100" r="3" fill="#FFE066" opacity="0.9" />
              <circle cx="130" cy="99"  r="2" fill="#FFE066" opacity="0.7" />
            </>
          )}
        </g>

        {/* Glasses */}
        {(config.accessory === 'glasses' || emotion === 'thinking') && (
          <g
            stroke={emotion === 'thinking' ? '#3A7BD5' : hairColor}
            strokeWidth="1.8" fill="none"
            opacity={emotion === 'thinking' ? 1 : 0.9}
          >
            <rect x="67"  y="100" width="28" height="18" rx="6" />
            <rect x="105" y="100" width="28" height="18" rx="6" />
            <line x1="95"  y1="109" x2="105" y2="109" />
            <line x1="48"  y1="107" x2="67"  y2="107" />
            <line x1="133" y1="107" x2="152" y2="107" />
            {emotion === 'thinking' && (
              <>
                <rect x="67"  y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.08" />
                <rect x="105" y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.08" />
              </>
            )}
          </g>
        )}

        {/* Nose */}
        <path d="M 96 118 Q 92 130 96 136 Q 100 139 104 136 Q 108 130 104 118"
          fill="none" stroke={skin} strokeWidth="1.5" opacity="0.45" />

        {/* Cheeks */}
        {(emotion === 'happy' || emotion === 'idea') && (
          <>
            <ellipse cx="68"  cy="126" rx="10" ry="6" fill="#E30613" opacity="0.11" />
            <ellipse cx="132" cy="126" rx="10" ry="6" fill="#E30613" opacity="0.11" />
          </>
        )}

        {/* Mouth */}
        {mouth === 'smile'         && <path d="M 82 144 Q 100 158 118 144" stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
        {mouth === 'gentle'        && <path d="M 85 146 Q 100 151 115 146" stroke="#8B5E3C" strokeWidth="2"   fill="none" strokeLinecap="round" />}
        {mouth === 'firm'          && <line x1="84" y1="146" x2="116" y2="146" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" />}
        {mouth === 'neutral-think' && <path d="M 86 147 Q 100 144 114 147" stroke="#8B5E3C" strokeWidth="2"   fill="none" strokeLinecap="round" />}
        {mouth === 'neutral'       && <path d="M 86 146 Q 100 150 114 146" stroke="#8B5E3C" strokeWidth="2"   fill="none" strokeLinecap="round" />}

        {/* Tie */}
        {config.accessory === 'tie' && (
          <g>
            <polygon points="100,170 95,180 100,195 105,180" fill="#E30613" />
            <polygon points="100,165 93,172 107,172"          fill="#B80510" />
          </g>
        )}

        {/* Emotion accessories */}
        {emotion === 'idea' && (
          <g>
            <g transform="translate(135,55)">
              <rect x="-18" y="-15" width="36" height="30" rx="4" fill="#1A1A2E" opacity="0.9" />
              <polyline points="-12,8 -6,0 2,5 10,-6" stroke="#00E5B0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <line x1="-12" y1="10" x2="12" y2="10" stroke="#FFF" strokeWidth="0.5" opacity="0.3" />
              <line x1="-12" y1="4"  x2="12" y2="4"  stroke="#FFF" strokeWidth="0.5" opacity="0.3" />
              <circle cx="10" cy="-6" r="3" fill="#FFE066" opacity="0.9" />
            </g>
            <path d="M 130 60 Q 128 80 125 90" stroke="#3A7BD5" strokeWidth="1"
              fill="none" strokeDasharray="3,2" opacity="0.5" />
          </g>
        )}
        {emotion === 'alert' && (
          <g transform="translate(148,95)">
            <polygon points="0,-14 14,14 -14,14" fill="#FF6B35" opacity="0.95" />
            <text x="0" y="8" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFF">!</text>
          </g>
        )}
        {emotion === 'thinking' && (
          <g>
            <circle cx="148" cy="75" r="6" fill="#7B5EA7" opacity="0.3">
              <animate attributeName="r"       values="6;9;6"       dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="62" r="4" fill="#7B5EA7" opacity="0.2">
              <animate attributeName="r"       values="4;6;4"        dur="1.5s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="168" cy="50" r="3" fill="#7B5EA7" opacity="0.15">
              <animate attributeName="r" values="3;5;3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

      </g>
    </svg>
  )
}

// ─── AvatarCharacter — animated wrapper ──────────────────────────────────────

interface AvatarCharacterProps {
  config:     AvatarConfig
  emotion:    CharacterEmotion
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarCharacter({
  config, emotion, size = 'lg', className = '',
}: AvatarCharacterProps) {
  const uid = useId().replace(/:/g, '')
  const [blinkPhase,  setBlinkPhase]  = useState(0)
  const [breathPhase, setBreathPhase] = useState(0)
  const tRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 0.05
      setBreathPhase(tRef.current)
      setBlinkPhase(p => { const n = p + 0.02; return n > 1 ? 0 : n })
    }, 60)
    return () => clearInterval(id)
  }, [])

  const sizeMap = { sm: 80, md: 140, lg: 200 }
  const px = sizeMap[size]

  return (
    <div
      className={className}
      style={{
        width: px, height: px * 1.3,
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.20))',
        flexShrink: 0,
      }}
    >
      <AvatarSVG
        config={config}
        emotion={emotion}
        blinkPhase={blinkPhase}
        breathPhase={breathPhase}
        uid={uid}
      />
    </div>
  )
}

// ─── AvatarEditor panel ───────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.33)',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

interface AvatarEditorProps {
  config:   AvatarConfig
  onChange: (key: keyof AvatarConfig, value: string) => void
  onClose:  () => void
}

export function AvatarEditor({ config, onChange, onClose }: AvatarEditorProps) {
  const [tab, setTab] = useState<'appearance' | 'outfit'>('appearance')

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
    }}>
      {/* Mini preview */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
        <AvatarCharacter config={config} emotion="happy" size="sm" />
      </div>

      {/* Name */}
      <div style={{ padding: '8px 16px 0' }}>
        <label style={{
          fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.38)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Numele asistentului
        </label>
        <input
          value={config.name}
          onChange={e => onChange('name', e.target.value)}
          maxLength={16}
          style={{
            display: 'block', width: '100%', marginTop: 6,
            padding: '7px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#FFF', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '10px 16px 0', gap: 4 }}>
        {(['appearance', 'outfit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '6px 4px', borderRadius: 7, border: 'none',
              background: tab === t ? '#E30613' : 'rgba(255,255,255,0.07)',
              color: '#FFF', fontSize: 11, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
            {t === 'appearance' ? 'Aspect' : 'Outfit'}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'appearance' && (
          <>
            <Section label="Ten">
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {SKIN_TONES.map(s => (
                  <button key={s.id} onClick={() => onChange('skinTone', s.id)} title={s.name}
                    style={{
                      width: 26, height: 26, borderRadius: '50%', background: s.color,
                      border: `2.5px solid ${config.skinTone === s.id ? '#FFF' : 'transparent'}`,
                      cursor: 'pointer',
                      transform: config.skinTone === s.id ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.1s',
                    }} />
                ))}
              </div>
            </Section>

            <Section label="Culoarea ochilor">
              <div style={{ display: 'flex', gap: 7 }}>
                {EYE_COLORS.map(c => (
                  <button key={c.id} onClick={() => onChange('eyeColor', c.id)} title={c.name}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: c.color,
                      border: `2.5px solid ${config.eyeColor === c.id ? '#FFF' : 'transparent'}`,
                      cursor: 'pointer',
                      transform: config.eyeColor === c.id ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.1s',
                    }} />
                ))}
              </div>
            </Section>

            <Section label="Stil păr">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {HAIR_STYLES.map(h => (
                  <button key={h.id} onClick={() => onChange('hairStyle', h.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                      border: `1px solid ${config.hairStyle === h.id ? '#E30613' : 'rgba(255,255,255,0.15)'}`,
                      background: config.hairStyle === h.id ? 'rgba(227,6,19,0.28)' : 'rgba(255,255,255,0.05)',
                      color: config.hairStyle === h.id ? '#FFF' : 'rgba(255,255,255,0.55)',
                      transition: 'all 0.15s',
                    }}>
                    {h.name}
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Culoare păr">
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {HAIR_COLORS.map(c => (
                  <button key={c.id} onClick={() => onChange('hairColor', c.id)} title={c.name}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: c.color,
                      border: `2.5px solid ${config.hairColor === c.id ? '#FFF' : 'rgba(255,255,255,0.2)'}`,
                      cursor: 'pointer',
                      transform: config.hairColor === c.id ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.1s',
                    }} />
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === 'outfit' && (
          <>
            <Section label="Ținută">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {OUTFITS.map(o => (
                  <button key={o.id} onClick={() => onChange('outfit', o.id)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                      border: `1px solid ${config.outfit === o.id ? '#E30613' : 'rgba(255,255,255,0.1)'}`,
                      background: config.outfit === o.id ? 'rgba(227,6,19,0.2)' : 'rgba(255,255,255,0.04)',
                      color: config.outfit === o.id ? '#FFF' : 'rgba(255,255,255,0.6)',
                      fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: config.outfit === o.id ? '#E30613' : 'rgba(255,255,255,0.2)',
                    }} />
                    {o.name}
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Accesoriu">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {ACCESSORIES.map(a => (
                  <button key={a.id} onClick={() => onChange('accessory', a.id)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                      border: `1px solid ${config.accessory === a.id ? '#E30613' : 'rgba(255,255,255,0.1)'}`,
                      background: config.accessory === a.id ? 'rgba(227,6,19,0.2)' : 'rgba(255,255,255,0.04)',
                      color: config.accessory === a.id ? '#FFF' : 'rgba(255,255,255,0.6)',
                      fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: config.accessory === a.id ? '#E30613' : 'rgba(255,255,255,0.2)',
                    }} />
                    {a.name}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        <button
          onClick={onClose}
          style={{
            padding: 10, borderRadius: 10, background: '#E30613',
            border: 'none', color: '#FFF', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', marginTop: 4,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'    }}
        >
          ✓ Salvează Avatarul
        </button>
      </div>
    </div>
  )
}
