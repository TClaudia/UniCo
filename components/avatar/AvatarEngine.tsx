'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AvatarEmotion } from '@/types'

interface AvatarEngineProps {
  emotion: AvatarEmotion
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: { container: 'w-12 h-12', face: 60, eye: 5, pupil: 2.5, mouth: 12 },
  md: { container: 'w-16 h-16', face: 80, eye: 7, pupil: 3.5, mouth: 16 },
  lg: { container: 'w-24 h-24', face: 120, eye: 10, pupil: 5, mouth: 22 },
  xl: { container: 'w-36 h-36', face: 180, eye: 14, pupil: 7, mouth: 32 },
}

const EMOTION_CONFIG: Record<AvatarEmotion, {
  bg: string
  bgGradient: string
  label: string
  animation: object
  eyeY: number
  pupilOffset: { x: number; y: number }
  browAngle: number
  mouthPath: string
  cheeks: boolean
  sparkles: boolean
  glasses: boolean
  sweat: boolean
}> = {
  happy: {
    bg: '#E2001A',
    bgGradient: 'from-uc-red to-rose-500',
    label: 'Fericit 😊',
    animation: { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    eyeY: 0,
    pupilOffset: { x: 0, y: 1 },
    browAngle: 5,
    mouthPath: 'M -8 0 Q 0 8 8 0',
    cheeks: true,
    sparkles: false,
    glasses: false,
    sweat: false,
  },
  thinking: {
    bg: '#0066CC',
    bgGradient: 'from-uc-blue to-blue-600',
    label: 'Gândesc... 🤔',
    animation: { rotate: [0, -2, 2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    eyeY: 0,
    pupilOffset: { x: 3, y: 0 },
    browAngle: -8,
    mouthPath: 'M -6 0 Q 0 2 6 0',
    cheeks: false,
    sparkles: false,
    glasses: false,
    sweat: false,
  },
  concerned: {
    bg: '#F5A623',
    bgGradient: 'from-uc-amber to-orange-500',
    label: 'Îngrijorat 😟',
    animation: { y: [0, -2, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
    eyeY: -2,
    pupilOffset: { x: 0, y: 2 },
    browAngle: -15,
    mouthPath: 'M -7 0 Q 0 -5 7 0',
    cheeks: false,
    sparkles: false,
    glasses: false,
    sweat: true,
  },
  enthusiastic: {
    bg: '#E2001A',
    bgGradient: 'from-uc-red via-rose-500 to-pink-500',
    label: 'Entuziasmat! 🚀',
    animation: { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } },
    eyeY: 0,
    pupilOffset: { x: 0, y: -1 },
    browAngle: 10,
    mouthPath: 'M -10 -2 Q 0 10 10 -2',
    cheeks: true,
    sparkles: true,
    glasses: false,
    sweat: false,
  },
  celebrating: {
    bg: '#00A862',
    bgGradient: 'from-uc-green to-emerald-500',
    label: 'Felicitări! 🎉',
    animation: { y: [0, -6, 0], scale: [1, 1.1, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' } },
    eyeY: 0,
    pupilOffset: { x: 0, y: -2 },
    browAngle: 15,
    mouthPath: 'M -10 0 Q 0 12 10 0',
    cheeks: true,
    sparkles: true,
    glasses: false,
    sweat: false,
  },
  informative: {
    bg: '#4A4A4A',
    bgGradient: 'from-uc-gray-700 to-slate-600',
    label: 'Informativ 📚',
    animation: { scale: [1, 1.02, 1], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
    eyeY: 0,
    pupilOffset: { x: 0, y: 0 },
    browAngle: 0,
    mouthPath: 'M -6 0 Q 0 3 6 0',
    cheeks: false,
    sparkles: false,
    glasses: true,
    sweat: false,
  },
}

function AvatarFace({ emotion, size }: { emotion: AvatarEmotion; size: keyof typeof SIZE_MAP }) {
  const cfg = EMOTION_CONFIG[emotion]
  const s = SIZE_MAP[size]
  const cx = s.face / 2
  const cy = s.face / 2
  const faceR = s.face * 0.42

  // Eye positions
  const leftEyeX = cx - s.face * 0.16
  const rightEyeX = cx + s.face * 0.16
  const eyeBaseY = cy - s.face * 0.08 + cfg.eyeY * (s.face / 60)
  const eyeR = s.eye

  // Mouth position
  const mouthX = cx
  const mouthY = cy + s.face * 0.16

  // Scale the mouth path
  const scale = s.face / 80
  const scaledMouthPath = cfg.mouthPath
    .replace(/-?\d+\.?\d*/g, (n) => String(parseFloat(n) * scale))

  return (
    <svg
      width={s.face}
      height={s.face}
      viewBox={`0 0 ${s.face} ${s.face}`}
      className="overflow-visible"
    >
      {/* Face circle */}
      <defs>
        <radialGradient id={`faceGrad_${emotion}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
        <filter id={`glow_${emotion}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={faceR} fill={cfg.bg} />
      <circle cx={cx} cy={cy} r={faceR} fill={`url(#faceGrad_${emotion})`} />

      {/* Cheeks */}
      {cfg.cheeks && (
        <>
          <ellipse cx={leftEyeX - eyeR * 0.5} cy={eyeBaseY + eyeR * 3} rx={eyeR * 1.4} ry={eyeR * 0.7} fill="rgba(255,255,255,0.25)" />
          <ellipse cx={rightEyeX + eyeR * 0.5} cy={eyeBaseY + eyeR * 3} rx={eyeR * 1.4} ry={eyeR * 0.7} fill="rgba(255,255,255,0.25)" />
        </>
      )}

      {/* Eyebrows */}
      <g transform={`translate(${leftEyeX}, ${eyeBaseY - eyeR * 1.8}) rotate(${-cfg.browAngle})`}>
        <line x1={-eyeR * 0.9} y1="0" x2={eyeR * 0.9} y2="0" stroke="white" strokeWidth={Math.max(1.5, s.face / 40)} strokeLinecap="round" opacity="0.9" />
      </g>
      <g transform={`translate(${rightEyeX}, ${eyeBaseY - eyeR * 1.8}) rotate(${cfg.browAngle})`}>
        <line x1={-eyeR * 0.9} y1="0" x2={eyeR * 0.9} y2="0" stroke="white" strokeWidth={Math.max(1.5, s.face / 40)} strokeLinecap="round" opacity="0.9" />
      </g>

      {/* Eyes */}
      {/* Left Eye */}
      <circle cx={leftEyeX} cy={eyeBaseY} r={eyeR} fill="white" />
      <circle
        cx={leftEyeX + cfg.pupilOffset.x * scale}
        cy={eyeBaseY + cfg.pupilOffset.y * scale}
        r={s.pupil}
        fill="#1A1A1A"
      />
      <circle
        cx={leftEyeX + cfg.pupilOffset.x * scale + s.pupil * 0.4}
        cy={eyeBaseY + cfg.pupilOffset.y * scale - s.pupil * 0.4}
        r={s.pupil * 0.3}
        fill="white"
        opacity="0.8"
      />

      {/* Right Eye */}
      <circle cx={rightEyeX} cy={eyeBaseY} r={eyeR} fill="white" />
      <circle
        cx={rightEyeX + cfg.pupilOffset.x * scale}
        cy={eyeBaseY + cfg.pupilOffset.y * scale}
        r={s.pupil}
        fill="#1A1A1A"
      />
      <circle
        cx={rightEyeX + cfg.pupilOffset.x * scale + s.pupil * 0.4}
        cy={eyeBaseY + cfg.pupilOffset.y * scale - s.pupil * 0.4}
        r={s.pupil * 0.3}
        fill="white"
        opacity="0.8"
      />

      {/* Glasses for informative */}
      {cfg.glasses && (
        <>
          <rect x={leftEyeX - eyeR * 1.3} y={eyeBaseY - eyeR * 1.3} width={eyeR * 2.6} height={eyeR * 2.6} rx={eyeR * 0.4} fill="none" stroke="white" strokeWidth={Math.max(1, s.face / 50)} opacity="0.8" />
          <rect x={rightEyeX - eyeR * 1.3} y={eyeBaseY - eyeR * 1.3} width={eyeR * 2.6} height={eyeR * 2.6} rx={eyeR * 0.4} fill="none" stroke="white" strokeWidth={Math.max(1, s.face / 50)} opacity="0.8" />
          <line x1={leftEyeX + eyeR * 1.3} y1={eyeBaseY} x2={rightEyeX - eyeR * 1.3} y2={eyeBaseY} stroke="white" strokeWidth={Math.max(1, s.face / 50)} opacity="0.8" />
        </>
      )}

      {/* Sweat drop */}
      {cfg.sweat && (
        <ellipse cx={cx + faceR * 0.75} cy={cy - faceR * 0.3} rx={eyeR * 0.5} ry={eyeR * 0.8} fill="rgba(255,255,255,0.6)" />
      )}

      {/* Mouth */}
      <g transform={`translate(${mouthX}, ${mouthY})`}>
        <path
          d={scaledMouthPath}
          fill="none"
          stroke="white"
          strokeWidth={Math.max(2, s.face / 30)}
          strokeLinecap="round"
        />
      </g>

      {/* Sparkles for celebrating/enthusiastic */}
      {cfg.sparkles && (
        <>
          <text x={cx - faceR * 0.9} y={cy - faceR * 0.7} fontSize={s.face * 0.13} textAnchor="middle">✨</text>
          <text x={cx + faceR * 0.8} y={cy - faceR * 0.6} fontSize={s.face * 0.13} textAnchor="middle">⭐</text>
          <text x={cx + faceR * 0.6} y={cy + faceR * 0.8} fontSize={s.face * 0.1} textAnchor="middle">✦</text>
        </>
      )}
    </svg>
  )
}

export function AvatarEngine({
  emotion,
  size = 'lg',
  showLabel = false,
  className = '',
}: AvatarEngineProps) {
  const cfg = EMOTION_CONFIG[emotion]
  const s = SIZE_MAP[size]

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        className={`${s.container} rounded-full relative flex items-center justify-center overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${cfg.bg}dd, ${cfg.bg})`,
          boxShadow: `0 4px 20px ${cfg.bg}50`,
        }}
        animate={cfg.animation}
        key={emotion}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={emotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            <AvatarFace emotion={emotion} size={size} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showLabel && (
        <motion.span
          key={`label-${emotion}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-uc-gray-400 font-medium"
        >
          {cfg.label}
        </motion.span>
      )}
    </div>
  )
}
