'use client'

import { useEffect, useState, useRef } from 'react'

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
  { id: 'brown', color: '#6B4226', name: 'Căprui'      },
  { id: 'blue',  color: '#3A7BD5', name: 'Albaștri'   },
  { id: 'green', color: '#2E8B57', name: 'Verzi'       },
  { id: 'hazel', color: '#8B7355', name: 'Căprui-verzi'},
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

// ─── Helper: lighten a hex color by mixing with white ───────────────────────
function lighten(hex: string, amount = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r + (255 - r) * amount)
  const lg = Math.round(g + (255 - g) * amount)
  const lb = Math.round(b + (255 - b) * amount)
  return `rgb(${lr},${lg},${lb})`
}

// ─── Hair renderer ───────────────────────────────────────────────────────────
function HairLayer({
  style, color, uid,
}: {
  style: HairStyleId
  color: string
  uid: string
}) {
  const hi   = lighten(color, 0.42)   // highlight
  const mid  = lighten(color, 0.18)   // midtone
  const dark = lighten(color, -0.1)   // shadow (slightly darker)

  const gTop  = `hair-top-${uid}`
  const gSide = `hair-side-${uid}`
  const gCurl = `hair-curl-${uid}`
  const gBun  = `hair-bun-${uid}`

  // Strand helper — radiating thin lines for texture
  const strands = (
    cx: number, cy: number,
    startAngDeg: number, endAngDeg: number,
    count: number, len: number,
  ) =>
    Array.from({ length: count }, (_, i) => {
      const ang = (startAngDeg + ((endAngDeg - startAngDeg) * i) / (count - 1)) * (Math.PI / 180)
      return (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + Math.cos(ang) * len}
          y2={cy + Math.sin(ang) * len}
          stroke={hi} strokeWidth="0.7" opacity="0.35"
          strokeLinecap="round"
        />
      )
    })

  // ── SHORT ──────────────────────────────────────────────────────────────────
  if (style === 'short') return (
    <g>
      <defs>
        <linearGradient id={gTop} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="45%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
      </defs>
      {/* Main cap — organic path hugging the top of the head */}
      <path
        d="M 51 93
           C 47 78, 52 60, 66 54
           C 79 49, 90 47, 100 47
           C 110 47, 121 49, 134 54
           C 148 60, 153 78, 149 93
           C 145 86, 138 80, 126 77
           C 114 74, 107 73, 100 73
           C 93 73, 86 74, 74 77
           C 62 80, 55 86, 51 93 Z"
        fill={`url(#${gTop})`}
      />
      {/* Highlight sheen */}
      <path
        d="M 82 52 C 90 48, 110 48, 118 52 C 113 57, 87 57, 82 52 Z"
        fill={hi} opacity="0.5"
      />
      {/* Fine strand lines radiating from crown */}
      {strands(100, 60, 210, 330, 8, 22)}
      {/* Sideburn left */}
      <path
        d="M 51 93 C 50 98, 49 104, 49 109
           C 52 109, 56 108, 57 104
           C 58 100, 56 95, 51 93 Z"
        fill={color} opacity="0.85"
      />
      {/* Sideburn right */}
      <path
        d="M 149 93 C 150 98, 151 104, 151 109
           C 148 109, 144 108, 143 104
           C 142 100, 144 95, 149 93 Z"
        fill={color} opacity="0.85"
      />
    </g>
  )

  // ── MEDIUM ─────────────────────────────────────────────────────────────────
  if (style === 'medium') return (
    <g>
      <defs>
        <linearGradient id={gTop} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="50%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
        <linearGradient id={gSide} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={color} />
          <stop offset="60%"  stopColor={mid}   />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
      </defs>
      {/* Top cap */}
      <path
        d="M 51 93
           C 47 78, 52 60, 66 54
           C 79 49, 90 47, 100 47
           C 110 47, 121 49, 134 54
           C 148 60, 153 78, 149 93
           C 145 86, 138 80, 126 77
           C 114 74, 107 73, 100 73
           C 93 73, 86 74, 74 77
           C 62 80, 55 86, 51 93 Z"
        fill={`url(#${gTop})`}
      />
      {/* Highlight sheen */}
      <path
        d="M 82 52 C 90 48, 110 48, 118 52 C 113 57, 87 57, 82 52 Z"
        fill={hi} opacity="0.4"
      />
      {/* Side-part line */}
      <path
        d="M 100 47 C 99 55, 98 62, 97 70"
        stroke={dark} strokeWidth="1" fill="none" opacity="0.4"
      />
      {/* Left flowing side — organic curved bottom */}
      <path
        d="M 51 93
           C 48 100, 46 110, 45 118
           C 44 126, 44 133, 46 139
           C 48 143, 52 145, 57 143
           C 61 140, 62 133, 62 125
           C 62 117, 62 108, 60 101
           C 58 96, 55 93, 51 93 Z"
        fill={`url(#${gSide})`}
      />
      {/* Left strand lines */}
      {strands(53, 100, 80, 140, 4, 18)}
      {/* Right flowing side */}
      <path
        d="M 149 93
           C 152 100, 154 110, 155 118
           C 156 126, 156 133, 154 139
           C 152 143, 148 145, 143 143
           C 139 140, 138 133, 138 125
           C 138 117, 138 108, 140 101
           C 142 96, 145 93, 149 93 Z"
        fill={`url(#${gSide})`}
      />
      {strands(147, 100, 40, 100, 4, 18)}
    </g>
  )

  // ── LONG ───────────────────────────────────────────────────────────────────
  if (style === 'long') return (
    <g>
      <defs>
        <linearGradient id={gTop} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="45%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
        <linearGradient id={gSide} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={color} />
          <stop offset="55%"  stopColor={mid}   />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
      </defs>
      {/* Back layer — behind the head */}
      <path
        d="M 46 95
           C 41 112, 39 130, 40 148
           C 40 162, 42 172, 45 180
           C 50 188, 58 188, 62 182
           C 64 175, 64 165, 64 155
           C 64 140, 63 124, 62 108
           C 61 100, 57 95, 46 95 Z"
        fill={dark} opacity="0.55"
      />
      <path
        d="M 154 95
           C 159 112, 161 130, 160 148
           C 160 162, 158 172, 155 180
           C 150 188, 142 188, 138 182
           C 136 175, 136 165, 136 155
           C 136 140, 137 124, 138 108
           C 139 100, 143 95, 154 95 Z"
        fill={dark} opacity="0.55"
      />
      {/* Top cap */}
      <path
        d="M 51 93
           C 47 78, 52 60, 66 54
           C 79 49, 90 47, 100 47
           C 110 47, 121 49, 134 54
           C 148 60, 153 78, 149 93
           C 145 86, 138 80, 126 77
           C 114 74, 107 73, 100 73
           C 93 73, 86 74, 74 77
           C 62 80, 55 86, 51 93 Z"
        fill={`url(#${gTop})`}
      />
      {/* Highlight */}
      <path
        d="M 80 52 C 88 48, 112 48, 120 52 C 115 58, 85 58, 80 52 Z"
        fill={hi} opacity="0.4"
      />
      {/* Left long piece with natural wave at end */}
      <path
        d="M 51 93
           C 47 105, 44 118, 43 132
           C 42 145, 42 158, 43 168
           C 44 176, 46 182, 50 184
           C 54 185, 58 182, 60 176
           C 61 168, 61 158, 61 146
           C 61 134, 61 120, 60 109
           C 59 102, 56 96, 51 93 Z"
        fill={`url(#${gSide})`}
      />
      {/* Wave detail lines left */}
      <path d="M 47 140 C 50 145, 52 150, 50 156" stroke={hi} strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M 51 155 C 54 162, 56 168, 54 174" stroke={hi} strokeWidth="1.0" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* Right long piece */}
      <path
        d="M 149 93
           C 153 105, 156 118, 157 132
           C 158 145, 158 158, 157 168
           C 156 176, 154 182, 150 184
           C 146 185, 142 182, 140 176
           C 139 168, 139 158, 139 146
           C 139 134, 139 120, 140 109
           C 141 102, 144 96, 149 93 Z"
        fill={`url(#${gSide})`}
      />
      <path d="M 153 140 C 150 145, 148 150, 150 156" stroke={hi} strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M 149 155 C 146 162, 144 168, 146 174" stroke={hi} strokeWidth="1.0" fill="none" opacity="0.35" strokeLinecap="round" />
    </g>
  )

  // ── CURLY ──────────────────────────────────────────────────────────────────
  if (style === 'curly') return (
    <g>
      <defs>
        <radialGradient id={gCurl} cx="50%" cy="30%" r="60%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="55%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </radialGradient>
      </defs>
      {/* Volume base */}
      <ellipse cx="100" cy="76" rx="58" ry="42" fill={dark} opacity="0.5" />
      {/* Curl clusters — back row */}
      {[55, 70, 85, 100, 115, 130, 145].map((cx, i) => (
        <circle key={`b${i}`} cx={cx} cy={66 + (i % 2) * 7} r={11}
          fill={color} opacity={0.75 + (i % 2) * 0.1} />
      ))}
      {/* Curl clusters — front row */}
      {[62, 78, 94, 110, 126, 142].map((cx, i) => (
        <circle key={`f${i}`} cx={cx} cy={55 + (i % 2) * 5} r={10}
          fill={`url(#${gCurl})`} opacity={0.88 + (i % 3) * 0.04} />
      ))}
      {/* Highlight dot on each front curl */}
      {[62, 78, 94, 110, 126, 142].map((cx, i) => (
        <circle key={`h${i}`} cx={cx - 3} cy={50 + (i % 2) * 5} r={3}
          fill={hi} opacity={0.35} />
      ))}
      {/* Center top fills gap */}
      <circle cx="100" cy="48" r="9" fill={`url(#${gCurl})`} />
      <circle cx="100" cy="48" r="3" fill={hi} opacity="0.4" />
    </g>
  )

  // ── BUN ────────────────────────────────────────────────────────────────────
  // style === 'bun'
  return (
    <g>
      <defs>
        <radialGradient id={gBun} cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="50%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </radialGradient>
        <linearGradient id={gTop} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={hi}    />
          <stop offset="55%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </linearGradient>
      </defs>
      {/* Sleek cap — flatter/tighter than short */}
      <path
        d="M 53 96
           C 49 82, 53 64, 67 57
           C 80 51, 91 50, 100 50
           C 109 50, 120 51, 133 57
           C 147 64, 151 82, 147 96
           C 143 89, 136 84, 124 81
           C 112 78, 106 77, 100 77
           C 94 77, 88 78, 76 81
           C 64 84, 57 89, 53 96 Z"
        fill={`url(#${gTop})`}
      />
      {/* Gather lines toward the top */}
      {strands(100, 64, 190, 350, 9, 16)}
      {/* Bun base disc (slightly behind bun sphere) */}
      <ellipse cx="100" cy="50" rx="21" ry="8" fill={dark} opacity="0.55" />
      {/* Main bun sphere */}
      <circle cx="100" cy="44" r="20" fill={`url(#${gBun})`} />
      {/* Wrapped strand arcs */}
      <path d="M 83 44 A 17 11 0 0 1 117 44" fill="none" stroke={hi} strokeWidth="1.4" opacity="0.45" />
      <path d="M 85 38 A 15 9 0 0 0 115 38"  fill="none" stroke={hi} strokeWidth="1.2" opacity="0.35" />
      <path d="M 88 50 A 12 7 0 0 1 112 50"  fill="none" stroke={mid} strokeWidth="1"   opacity="0.3"  />
      {/* Shine specular */}
      <ellipse cx="92" cy="37" rx="7" ry="4" fill={hi} opacity="0.45" />
    </g>
  )
}

// ─── Raw SVG character (exported for direct embedding) ───────────────────────

export interface AvatarSVGProps {
  config: AvatarConfig
  emotion: CharacterEmotion
  blinkPhase: number
  breathPhase: number
}

export function AvatarSVG({ config, emotion, blinkPhase, breathPhase }: AvatarSVGProps) {
  const skin      = SKIN_TONES.find(s => s.id === config.skinTone)?.color  ?? '#FDDBB4'
  const hairColor = HAIR_COLORS.find(h => h.id === config.hairColor)?.color ?? '#1C1C1C'
  const eyeColor  = EYE_COLORS.find(e => e.id === config.eyeColor)?.color   ?? '#6B4226'

  const breathOffset = Math.sin(breathPhase) * 1.5
  const isBlinking   = blinkPhase > 0.85

  // Unique ID per SVG instance to avoid `defs` collisions when multiple on the page
  const uid = `${config.hairStyle}-${config.hairColor}`

  const eyeRy = isBlinking ? 1.5 : (emotion === 'idea' ? 10 : 8)

  // ── Eyebrows ──────────────────────────────────────────────────────────────
  type BrowType = 'worried' | 'stern' | 'default'
  const getBrows = (): { leftY: number; rightY: number; type: BrowType } => {
    if (emotion === 'thinking')   return { leftY: 72, rightY: 68, type: 'stern'   }
    if (emotion === 'empathetic') return { leftY: 70, rightY: 70, type: 'worried' }
    if (emotion === 'alert')      return { leftY: 68, rightY: 68, type: 'stern'   }
    return { leftY: 73, rightY: 73, type: 'default' }
  }
  const brows = getBrows()

  // ── Mouth ─────────────────────────────────────────────────────────────────
  const getMouth = () => {
    if (emotion === 'happy' || emotion === 'idea')  return 'smile'
    if (emotion === 'empathetic')                   return 'gentle'
    if (emotion === 'alert')                        return 'firm'
    if (emotion === 'thinking')                     return 'neutral-think'
    return 'neutral'
  }
  const mouth = getMouth()

  // ── Eye gaze ──────────────────────────────────────────────────────────────
  const getGaze = () => {
    if (emotion === 'thinking') return { dx: 4,  dy: -3 }
    if (emotion === 'typing')   return { dx: -5, dy: 6  }
    if (emotion === 'idea')     return { dx: 0,  dy: -2 }
    return { dx: 0, dy: 0 }
  }
  const gaze = getGaze()

  // ── Skin shadow (below hair) ───────────────────────────────────────────────
  const skinShadow = `${skin}88`

  return (
    <svg
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`skin-${uid}`} cx="44%" cy="38%" r="58%">
          <stop offset="0%"   stopColor={skin}         />
          <stop offset="75%"  stopColor={skin}         />
          <stop offset="100%" stopColor={skinShadow}   />
        </radialGradient>
        <filter id={`shadow-${uid}`}>
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.18" />
        </filter>
      </defs>

      <g transform={`translate(0, ${breathOffset})`}>

        {/* ── Body ── */}
        {config.outfit === 'suit' && (
          <g>
            <ellipse cx="100" cy="230" rx="66" ry="46" fill="#1A1A2E" />
            <rect x="34" y="194" width="132" height="72" rx="13" fill="#1A1A2E" />
            {/* Shirt */}
            <rect x="88" y="174" width="24" height="56" rx="2" fill="#FFFFFF" opacity="0.12" />
            {/* Tie */}
            {config.accessory !== 'tie' && (
              <rect x="95" y="174" width="10" height="52" rx="1" fill="#E30613" opacity="0.75" />
            )}
            {/* Lapels */}
            <path d="M 88 174 L 70 195 L 34 195 L 34 200 L 68 200 Z" fill="#162035" />
            <path d="M 112 174 L 130 195 L 166 195 L 166 200 L 132 200 Z" fill="#162035" />
            <rect x="82" y="174" width="36" height="9" rx="2" fill="#F0EFED" />
          </g>
        )}
        {config.outfit === 'smart' && (
          <g>
            <ellipse cx="100" cy="230" rx="66" ry="46" fill="#3D4A5C" />
            <rect x="34" y="194" width="132" height="72" rx="13" fill="#3D4A5C" />
            <rect x="34" y="194" width="32" height="56" rx="9" fill="#2E3B4A" />
            <rect x="134" y="194" width="32" height="56" rx="9" fill="#2E3B4A" />
            <rect x="80" y="174" width="40" height="9" rx="2" fill="#DDD9D3" />
          </g>
        )}
        {config.outfit === 'business' && (
          <g>
            <ellipse cx="100" cy="230" rx="66" ry="46" fill="#C8050F" opacity="0.88" />
            <rect x="34" y="194" width="132" height="72" rx="13" fill="#C8050F" opacity="0.88" />
            <rect x="34" y="194" width="32" height="56" rx="9" fill="#A00410" opacity="0.9" />
            <rect x="134" y="194" width="32" height="56" rx="9" fill="#A00410" opacity="0.9" />
            <rect x="80" y="174" width="40" height="9" rx="2" fill="#FFFFFF" opacity="0.25" />
          </g>
        )}

        {/* ── Neck ── */}
        <path
          d="M 86 162 C 86 175 88 184 100 184 C 112 184 114 175 114 162 Z"
          fill={skin}
        />

        {/* ── Head ── */}
        <g filter={`url(#shadow-${uid})`}>
          <ellipse cx="100" cy="115" rx="54" ry="62" fill={`url(#skin-${uid})`} />
        </g>

        {/* Hair back layer for long style */}
        {config.hairStyle === 'long' && (
          <g>
            <path d="M 46 95 C 40 115 38 135 40 155 C 42 172 46 182 52 186
                     C 42 180 40 165 39 148 C 38 130 40 110 44 93 Z"
              fill={HAIR_COLORS.find(h => h.id === config.hairColor)?.color ?? '#1C1C1C'} opacity="0.4" />
            <path d="M 154 95 C 160 115 162 135 160 155 C 158 172 154 182 148 186
                     C 158 180 160 165 161 148 C 162 130 160 110 156 93 Z"
              fill={HAIR_COLORS.find(h => h.id === config.hairColor)?.color ?? '#1C1C1C'} opacity="0.4" />
          </g>
        )}

        {/* ── Ears ── */}
        <ellipse cx="46"  cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="154" cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="46"  cy="118" rx="5" ry="7"  fill={skin} opacity="0.55" />
        <ellipse cx="154" cy="118" rx="5" ry="7"  fill={skin} opacity="0.55" />

        {/* Earrings */}
        {config.accessory === 'earrings' && (
          <>
            <circle cx="46"  cy="129" r="4" fill="#D4AA50" />
            <circle cx="154" cy="129" r="4" fill="#D4AA50" />
            <circle cx="46"  cy="129" r="2" fill="#FFD700" opacity="0.6" />
            <circle cx="154" cy="129" r="2" fill="#FFD700" opacity="0.6" />
          </>
        )}

        {/* ── HAIR (front layers, drawn over ears) ── */}
        <HairLayer style={config.hairStyle} color={hairColor} uid={uid} />

        {/* ── Forehead subtle highlight ── */}
        <ellipse cx="100" cy="96" rx="18" ry="11" fill="#FFFFFF" opacity="0.07" />

        {/* ── Eyebrows ── */}
        <g stroke={hairColor} strokeWidth="2.6" strokeLinecap="round" fill="none">
          {brows.type === 'worried' ? (
            <>
              <path d={`M 70 ${brows.leftY}  Q 80 ${brows.leftY  - 5} 90 ${brows.leftY}`}  />
              <path d={`M 110 ${brows.rightY} Q 120 ${brows.rightY - 5} 130 ${brows.rightY}`} />
            </>
          ) : brows.type === 'stern' ? (
            <>
              <line x1="68" y1={brows.leftY  + 3} x2="90"  y2={brows.leftY  - 3} />
              <line x1="110" y1={brows.rightY - 3} x2="132" y2={brows.rightY + 3} />
            </>
          ) : (
            <>
              <path d={`M 70 ${brows.leftY}  Q 80 ${brows.leftY  - 4} 90 ${brows.leftY}`}  />
              <path d={`M 110 ${brows.rightY} Q 120 ${brows.rightY - 4} 130 ${brows.rightY}`} />
            </>
          )}
        </g>

        {/* ── Eyes ── */}
        <g transform={`translate(${gaze.dx}, ${gaze.dy})`}>
          {/* Left */}
          <ellipse cx="80"  cy="108" rx="11" ry={eyeRy} fill="#FFFFFF" />
          {!isBlinking && <ellipse cx="80"  cy="108" rx="6.5" ry="6.5" fill={eyeColor} />}
          {!isBlinking && <circle  cx="80"  cy="108" r="4"  fill="#111" />}
          {!isBlinking && <circle  cx="82"  cy="105" r="1.6" fill="#FFF" />}
          {/* Right */}
          <ellipse cx="120" cy="108" rx="11" ry={eyeRy} fill="#FFFFFF" />
          {!isBlinking && <ellipse cx="120" cy="108" rx="6.5" ry="6.5" fill={eyeColor} />}
          {!isBlinking && <circle  cx="120" cy="108" r="4"  fill="#111" />}
          {!isBlinking && <circle  cx="122" cy="105" r="1.6" fill="#FFF" />}
          {/* Sparkle on idea */}
          {emotion === 'idea' && !isBlinking && (
            <>
              <circle cx="73"  cy="100" r="3" fill="#FFE066" opacity="0.9" />
              <circle cx="90"  cy="99"  r="2" fill="#FFE066" opacity="0.7" />
              <circle cx="113" cy="100" r="3" fill="#FFE066" opacity="0.9" />
              <circle cx="130" cy="99"  r="2" fill="#FFE066" opacity="0.7" />
            </>
          )}
        </g>

        {/* ── Glasses ── */}
        {(config.accessory === 'glasses' || emotion === 'thinking') && (
          <g
            stroke={emotion === 'thinking' ? '#3A7BD5' : hairColor}
            strokeWidth="1.8" fill="none"
            opacity={emotion === 'thinking' ? 1 : 0.88}
          >
            <rect x="67" y="100" width="28" height="18" rx="6" />
            <rect x="105" y="100" width="28" height="18" rx="6" />
            <line x1="95" y1="109" x2="105" y2="109" />
            <line x1="48" y1="107" x2="67"  y2="107" />
            <line x1="133" y1="107" x2="152" y2="107" />
            {emotion === 'thinking' && (
              <>
                <rect x="67" y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.07" />
                <rect x="105" y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.07" />
              </>
            )}
          </g>
        )}

        {/* ── Nose ── */}
        <path d="M 96 118 Q 92 130 96 136 Q 100 139 104 136 Q 108 130 104 118"
          fill="none" stroke={skin} strokeWidth="1.6" opacity="0.4" />

        {/* ── Cheek blush ── */}
        {(emotion === 'happy' || emotion === 'idea') && (
          <>
            <ellipse cx="68"  cy="126" rx="11" ry="6" fill="#E30613" opacity="0.11" />
            <ellipse cx="132" cy="126" rx="11" ry="6" fill="#E30613" opacity="0.11" />
          </>
        )}

        {/* ── Mouth ── */}
        {mouth === 'smile' && (
          <path d="M 81 143 Q 100 159 119 143"
            stroke="#7A4A2A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}
        {mouth === 'gentle' && (
          <path d="M 86 146 Q 100 153 114 146"
            stroke="#7A4A2A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        )}
        {mouth === 'firm' && (
          <line x1="84" y1="146" x2="116" y2="146"
            stroke="#7A4A2A" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mouth === 'neutral-think' && (
          <path d="M 86 147 Q 100 143 114 147"
            stroke="#7A4A2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {mouth === 'neutral' && (
          <path d="M 86 145 Q 100 150 114 145"
            stroke="#7A4A2A" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* ── Tie accessory ── */}
        {config.accessory === 'tie' && (
          <g>
            <polygon points="100,170 94,182 100,198 106,182" fill="#E30613" />
            <polygon points="100,164 92,172 108,172"           fill="#B00510" />
            <line x1="100" y1="172" x2="100" y2="192"
              stroke="#FF4455" strokeWidth="0.8" opacity="0.5" />
          </g>
        )}

        {/* ── Emotion overlays ── */}
        {emotion === 'idea' && (
          <g>
            <g transform="translate(136, 54)">
              <rect x="-18" y="-16" width="36" height="30" rx="4" fill="#1A1A2E" opacity="0.92" />
              <polyline points="-12,8 -5,0 3,6 11,-7"
                stroke="#00E5B0" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="-12" y1="11" x2="12" y2="11" stroke="#FFF" strokeWidth="0.5" opacity="0.25" />
              <line x1="-12" y1="5"  x2="12" y2="5"  stroke="#FFF" strokeWidth="0.5" opacity="0.25" />
              <circle cx="11" cy="-7" r="3.5" fill="#FFE066" opacity="0.9" />
            </g>
            <path d="M 130 60 Q 128 80 124 90"
              stroke="#3A7BD5" strokeWidth="1.2" fill="none" strokeDasharray="3,2.5" opacity="0.5" />
          </g>
        )}
        {emotion === 'alert' && (
          <g transform="translate(148, 92)">
            <polygon points="0,-15 15,14 -15,14" fill="#FF6B35" opacity="0.95" />
            <text x="0" y="9" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFFFFF">!</text>
          </g>
        )}
        {emotion === 'thinking' && (
          <g>
            {[
              { cx: 148, cy: 74, r: 6.5, delay: '0s'    },
              { cx: 160, cy: 62, r: 4.5, delay: '0.3s'  },
              { cx: 169, cy: 51, r: 3,   delay: '0.6s'  },
            ].map(({ cx, cy, r, delay }) => (
              <circle key={delay} cx={cx} cy={cy} r={r} fill="#7B5EA7" opacity="0.25">
                <animate attributeName="r"       values={`${r};${r * 1.5};${r}`} dur="1.5s" begin={delay} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0.08;0.25"         dur="1.5s" begin={delay} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

      </g>
    </svg>
  )
}

// ─── AvatarCharacter — animated wrapper ─────────────────────────────────────

interface AvatarCharacterProps {
  config:    AvatarConfig
  emotion:   CharacterEmotion
  size?:     'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarCharacter({
  config, emotion, size = 'lg', className = '',
}: AvatarCharacterProps) {
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
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.22))',
      }}
    >
      <AvatarSVG
        config={config}
        emotion={emotion}
        blinkPhase={blinkPhase}
        breathPhase={breathPhase}
      />
    </div>
  )
}

// ─── AvatarEditor panel ──────────────────────────────────────────────────────

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
        <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.38)',
          letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
                      cursor: 'pointer', transform: config.skinTone === s.id ? 'scale(1.2)' : 'scale(1)',
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
                      cursor: 'pointer', transform: config.eyeColor === c.id ? 'scale(1.2)' : 'scale(1)',
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
                      cursor: 'pointer', transform: config.hairColor === c.id ? 'scale(1.2)' : 'scale(1)',
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
