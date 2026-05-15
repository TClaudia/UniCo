'use client'

import { motion } from 'framer-motion'
import { LLMResponse } from '@/types'

interface ProductCTAProps {
  cta: NonNullable<LLMResponse['product_cta']>
}

export function ProductCTA({ cta }: ProductCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 w-full"
    >
      <a
        href={cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-uc-red text-white rounded-btn px-4 py-2.5 text-sm font-semibold hover:bg-uc-red-dark active:scale-95 transition-all shadow-chat"
      >
        {cta.type === 'calculator' && '🧮 '}
        {cta.type === 'product_page' && '📋 '}
        {cta.type === 'contact_advisor' && '👤 '}
        {cta.label}
      </a>
      <a
        href="https://www.unicredit.ro/contact"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 border border-uc-gray-400 text-uc-gray-700 rounded-btn px-4 py-2.5 text-sm font-medium hover:border-uc-gray-700 active:scale-95 transition-all"
      >
        👤 Contactează Consultant
      </a>
    </motion.div>
  )
}
