'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  'Cum economisesc mai eficient?',
  'Ce este dobânda compusă?',
  'Cum îmi construiesc un fond de urgență?',
  'Ce investiții sunt potrivite pentru mine?',
  'Cum funcționează un credit ipotecar?',
]

interface ChatInputBarProps {
  onSend: (message: string) => void
  isLoading: boolean
  showSuggestions?: boolean
}

export function ChatInputBar({ onSend, isLoading, showSuggestions = false }: ChatInputBarProps) {
  const [input, setInput] = useState('')
  const [suggestionsUsed, setSuggestionsUsed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
    setSuggestionsUsed(true)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (s: string) => {
    setInput(s)
    setSuggestionsUsed(true)
    textareaRef.current?.focus()
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
  }

  return (
    <div className="bg-white border-t border-uc-gray-100">
      {/* Suggestion Chips */}
      <AnimatePresence>
        {showSuggestions && !suggestionsUsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 pb-1"
          >
            <p className="text-xs text-uc-gray-400 mb-2 font-medium">Întrebări frecvente:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="flex-shrink-0 px-3 py-1.5 bg-uc-off-white rounded-pill text-xs text-uc-gray-700 font-medium hover:bg-uc-gray-100 active:bg-uc-gray-100 transition-colors border border-uc-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Row */}
      <div className="flex items-end gap-2 px-3 py-3">
        <div className="flex-1 bg-uc-off-white rounded-2xl px-4 py-2.5 border border-uc-gray-100 focus-within:border-uc-red transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Scrie o întrebare financiară..."
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-uc-black placeholder:text-uc-gray-400 resize-none outline-none leading-5 max-h-24 font-body"
            style={{ height: 'auto' }}
          />
        </div>

        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          whileTap={{ scale: 0.9 }}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            input.trim() && !isLoading
              ? 'bg-uc-red shadow-md hover:bg-uc-red-dark'
              : 'bg-uc-gray-100'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-uc-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() ? 'white' : '#ABABAB'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  )
}
