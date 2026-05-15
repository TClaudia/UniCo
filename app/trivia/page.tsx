'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TriviaCardStack } from '@/components/gamification/TriviaCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TriviaCard } from '@/types'
import { getProfile } from '@/lib/storage'
import { addPoints, incrementTriviaCorrect } from '@/lib/gamification'

export default function TriviaPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<TriviaCard[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const profile = getProfile()
    if (!profile) {
      router.push('/onboarding')
      return
    }
    fetchQuestions()
  }, [router])

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/trivia?count=10')
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch {
      // Fallback: import directly
      const { TRIVIA_QUESTIONS } = await import('@/lib/triviaData')
      const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = useCallback((correct: boolean, points: number) => {
    setTotalAnswered(prev => prev + 1)
    if (correct) {
      setScore(prev => prev + points)
      addPoints(points)
      incrementTriviaCorrect()
    }
  }, [])

  const handleComplete = useCallback(() => {
    setGameOver(true)
  }, [])

  const handleRestart = () => {
    setScore(0)
    setTotalAnswered(0)
    setGameOver(false)
    setLoading(true)
    fetchQuestions()
  }

  const percentage = questions.length > 0 ? Math.round((score / (questions.length * 15)) * 100) : 0

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-uc-red animate-pulse" />
            <p className="text-uc-gray-400 text-sm">Se încarcă întrebările...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (gameOver) {
    const grade =
      percentage >= 80 ? '🏆 Expert' :
      percentage >= 60 ? '🥇 Bun' :
      percentage >= 40 ? '📚 În Progres' :
      '💪 Continuă să Înveți'

    return (
      <PageWrapper>
        <div className="px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '😊' : '📖'}
              </div>
              <h2 className="font-display font-bold text-2xl text-uc-black">
                Sesiunea s-a terminat!
              </h2>
              <p className="text-uc-gray-400 mt-1">{grade}</p>

              <div className="mt-6 bg-uc-off-white rounded-card p-4">
                <div className="text-4xl font-bold text-uc-red">{score}</div>
                <div className="text-sm text-uc-gray-400">puncte câștigate</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-btn p-3">
                  <div className="text-xl font-bold text-uc-green">{totalAnswered}</div>
                  <div className="text-xs text-uc-gray-400">răspunsuri</div>
                </div>
                <div className="bg-blue-50 rounded-btn p-3">
                  <div className="text-xl font-bold text-uc-blue">{percentage}%</div>
                  <div className="text-xs text-uc-gray-400">scor final</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button variant="primary" fullWidth onClick={handleRestart}>
                  Joacă din nou 🔄
                </Button>
                <Button variant="secondary" fullWidth onClick={() => router.push('/dashboard')}>
                  Înapoi la Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="px-4 py-4">
        {/* Score Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <div>
              <p className="text-xs text-uc-gray-400">Scor curent</p>
              <p className="font-bold text-uc-black">{score} puncte</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-uc-gray-400">Progres</p>
              <p className="font-bold text-uc-black">{totalAnswered}/{questions.length}</p>
            </div>
            <div className="w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F0F0" strokeWidth="3.8" />
                <circle
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  stroke="#E2001A"
                  strokeWidth="3.8"
                  strokeDasharray={`${(totalAnswered / questions.length) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Trivia Stack */}
        <TriviaCardStack
          questions={questions}
          onAnswer={handleAnswer}
          onComplete={handleComplete}
        />
      </div>
    </PageWrapper>
  )
}
