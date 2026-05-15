'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AvatarCharacter, DEFAULT_AVATAR_CONFIG, AvatarConfig } from '@/components/avatar/AvatarCharacter'

interface Step0Props {
  isClient: boolean
  onChange: (val: boolean) => void
  onNext: () => void
}

export function Step0Welcome({ isClient, onChange, onNext }: Step0Props) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG)

  useEffect(() => {
    try {
      const s = localStorage.getItem('uc_avatar_config')
      if (s) setAvatarConfig(JSON.parse(s))
    } catch {}
  }, [])

  const handleSelect = (val: boolean) => {
    onChange(val)
    setTimeout(onNext, 200)
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-sm w-full"
      >
        {/* Mascot avatar */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="relative"
        >
          {/* Glow ring behind avatar */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ background: 'radial-gradient(circle, #E30613 0%, transparent 70%)', transform: 'scale(1.2)' }}
          />
          <AvatarCharacter config={avatarConfig} emotion="idea" size="lg" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-display font-bold text-3xl text-uc-black leading-tight">
            Bun venit la<br />
            <span className="text-uc-red">UniCredit AI Coach</span>
          </h1>
          <p className="mt-3 text-uc-gray-700 text-base leading-relaxed">
            Coach-ul tău financiar personal, disponibil 24/7. Hai să-ți construim un profil pentru sfaturi personalizate!
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 w-full"
        >
          {[
            { icon: '🎯', label: 'Obiective', sub: 'personalizate' },
            { icon: '💬', label: 'Chat AI', sub: '24/7 disponibil' },
            { icon: '🧠', label: 'Trivia', sub: 'câștigă puncte' },
          ].map((item) => (
            <div key={item.label} className="flex-1 bg-white rounded-card p-3 shadow-chat text-center">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs font-semibold text-uc-black">{item.label}</div>
              <div className="text-xs text-uc-gray-400">{item.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full"
        >
          <p className="font-display font-semibold text-uc-black text-lg mb-4">
            Ești deja client UniCredit?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelect(true)}
              className={`w-full py-4 px-6 rounded-pill font-semibold text-base transition-all active:scale-95 ${
                isClient
                  ? 'bg-uc-red text-white shadow-floating'
                  : 'bg-white text-uc-black border-2 border-uc-gray-100 hover:border-uc-red hover:text-uc-red'
              }`}
            >
              ✅ Da, sunt client UniCredit
            </button>
            <button
              onClick={() => handleSelect(false)}
              className={`w-full py-4 px-6 rounded-pill font-semibold text-base transition-all active:scale-95 ${
                !isClient && isClient !== null
                  ? 'bg-uc-red text-white shadow-floating'
                  : 'bg-white text-uc-black border-2 border-uc-gray-100 hover:border-uc-red hover:text-uc-red'
              }`}
            >
              🔍 Nu încă, vreau să aflu mai multe
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
