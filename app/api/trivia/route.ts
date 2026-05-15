import { NextRequest, NextResponse } from 'next/server'
import { TRIVIA_QUESTIONS } from '@/lib/triviaData'
import { TriviaCard } from '@/types'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10', 10)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    let questions: TriviaCard[] = TRIVIA_QUESTIONS

    if (category) {
      questions = questions.filter(q => q.category === category)
    }

    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty)
    }

    const shuffled = shuffleArray(questions)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    return NextResponse.json({
      questions: selected,
      total: selected.length,
      available_categories: ['budgeting', 'investing', 'credit', 'savings', 'taxes'],
    })
  } catch (error) {
    console.error('Trivia API error:', error)
    return NextResponse.json(
      { error: 'Failed to load trivia questions', questions: [] },
      { status: 500 }
    )
  }
}
