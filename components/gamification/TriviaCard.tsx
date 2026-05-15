'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TriviaCard } from '@/types'

interface TriviaCardStackProps {
  questions: TriviaCard[]
  onAnswer: (correct: boolean, points: number) => void
  onComplete: () => void
}

interface SingleCardProps {
  question: TriviaCard
  onAnswered: (correct: boolean) => void
  isTop: boolean
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Ușor', color: 'text-uc-green', bg: 'bg-green-50' },
  medium: { label: 'Mediu', color: 'text-uc-amber', bg: 'bg-amber-50' },
  hard: { label: 'Dificil', color: 'text-uc-red', bg: 'bg-red-50' },
}

const CATEGORY_LABELS: Record<string, string> = {
  budgeting: 'Bugetare',
  investing: 'Investiții',
  credit: 'Credit',
  savings: 'Economii',
  taxes: 'Impozite',
}

function SingleTriviaCard({ question, onAnswered, isTop }: SingleCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const diff = DIFFICULTY_LABELS[question.difficulty]

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelectedIndex(idx)
    setRevealed(true)
    const correct = idx === question.correct_index
    setTimeout(() => onAnswered(correct), 1500)
  }

  const getOptionStyle = (idx: number) => {
    if (!revealed) {
      return 'bg-white border-uc-gray-100 text-uc-black hover:border-uc-red active:scale-95'
    }
    if (idx === question.correct_index) {
      return 'bg-green-50 border-uc-green text-uc-green'
    }
    if (idx === selectedIndex && idx !== question.correct_index) {
      return 'bg-red-50 border-uc-red text-uc-red'
    }
    return 'bg-white border-uc-gray-100 text-uc-gray-400 opacity-60'
  }

  return (
    <div className="bg-white rounded-card shadow-floating p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-pill ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
          <span className="text-xs text-uc-gray-400">
            {CATEGORY_LABELS[question.category]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-uc-amber">+{question.points}</span>
          <span className="text-sm">⭐</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="font-display font-semibold text-base text-uc-black leading-snug mb-5">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={revealed}
            className={`w-full text-left px-4 py-3 rounded-btn border-2 text-sm font-medium transition-all ${getOptionStyle(idx)}`}
          >
            <span className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold mt-0.5">
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span>{option}</span>
              {revealed && idx === question.correct_index && (
                <span className="ml-auto flex-shrink-0">✅</span>
              )}
              {revealed && idx === selectedIndex && idx !== question.correct_index && (
                <span className="ml-auto flex-shrink-0">❌</span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`p-3 rounded-btn ${selectedIndex === question.correct_index ? 'bg-green-50 border border-green-100' : 'bg-blue-50 border border-blue-100'}`}>
              <p className="text-xs font-semibold mb-1">
                {selectedIndex === question.correct_index ? '✅ Corect!' : '📚 Explicație:'}
              </p>
              <p className="text-xs text-uc-gray-700 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TriviaCardStack({ questions, onAnswer, onComplete }: TriviaCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleAnswered = useCallback((correct: boolean) => {
    const q = questions[currentIndex]
    onAnswer(correct, q.points)

    if (currentIndex + 1 >= questions.length) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, questions, onAnswer, onComplete])

  if (currentIndex >= questions.length) {
    return null
  }

  return (
    <div className="relative w-full">
      {/* Stack effect - show next cards peeking */}
      {currentIndex + 2 < questions.length && (
        <div
          className="absolute inset-x-4 bg-white rounded-card shadow-chat"
          style={{ top: 16, zIndex: 1 }}
        />
      )}
      {currentIndex + 1 < questions.length && (
        <div
          className="absolute inset-x-2 bg-white rounded-card shadow-chat"
          style={{ top: 8, zIndex: 2 }}
        />
      )}

      {/* Current card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <SingleTriviaCard
            question={questions[currentIndex]}
            onAnswered={handleAnswered}
            isTop={true}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < currentIndex
                ? 'bg-uc-green w-4'
                : i === currentIndex
                ? 'bg-uc-red w-4'
                : 'bg-uc-gray-100 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
