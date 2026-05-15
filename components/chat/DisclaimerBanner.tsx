'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-50 border-b border-amber-200"
        >
          <div className="flex items-start gap-2 px-4 py-2.5">
            <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 flex-1 leading-relaxed">
              <strong>Disclaimer:</strong> Informațiile oferite au scop educativ și nu constituie sfat financiar sau de investiții. Consultați un specialist autorizat înainte de orice decizie financiară.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-500 hover:text-amber-700 flex-shrink-0 ml-1 transition-colors"
              aria-label="Închide"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
