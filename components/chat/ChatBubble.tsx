'use client'

import { motion } from 'framer-motion'
import { ChatMessage } from '@/types'
import { ProductCTA } from './ProductCTA'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-uc-red to-uc-red-dark flex items-center justify-center flex-shrink-0 shadow-chat">
          <span className="text-white text-xs font-bold font-display">AI</span>
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Main bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`px-4 py-3 rounded-2xl shadow-chat ${
            isUser
              ? 'bg-uc-red text-white rounded-br-sm'
              : 'bg-white text-uc-black rounded-bl-sm'
          }`}
        >
          <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-uc-black'}`}>
            {message.content}
          </p>

          {/* Product mention */}
          {!isUser && message.product && (
            <div className="mt-2 pt-2 border-t border-uc-gray-100">
              <span className="text-xs text-uc-blue font-medium">
                📦 {message.product}
              </span>
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        {!isUser && message.showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-btn max-w-full"
          >
            <p className="text-xs text-amber-800">
              ⚠️ Acest răspuns are scop educativ și nu constituie sfat financiar personalizat. Consultați un specialist înainte de orice decizie.
            </p>
          </motion.div>
        )}

        {/* Product CTA */}
        {!isUser && message.cta && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <ProductCTA cta={message.cta} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
