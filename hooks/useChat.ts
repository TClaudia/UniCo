'use client'

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatMessage, LLMResponse } from '@/types'
import { getProfile } from '@/lib/storage'
import { addPoints, unlockBadge } from '@/lib/gamification'
import type { CharacterEmotion } from '@/components/avatar/AvatarCharacter'

interface UseChatReturn {
  messages: ChatMessage[]
  emotion: CharacterEmotion
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Bună ziua! Sunt consilierul tău financiar AI de la UniCredit. Sunt aici să te ajut cu întrebări despre economii, investiții, credite sau planificare financiară. Cu ce te pot ajuta astăzi?',
  showDisclaimer: false,
}

// Maps LLM avatar_emotion values to CharacterEmotion values
function mapAvatarEmotion(emotion: string): CharacterEmotion {
  const map: Record<string, CharacterEmotion> = {
    happy: 'happy',
    thinking: 'thinking',
    concerned: 'empathetic',
    enthusiastic: 'idea',
    celebrating: 'happy',
    informative: 'thinking',
  }
  return (map[emotion] as CharacterEmotion) ?? 'idle'
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [emotion, setEmotion] = useState<CharacterEmotion>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const isFirstMessageRef = useRef(true)
  // Keep a stable ref for the conversation history to avoid stale closures
  const messagesRef = useRef<ChatMessage[]>([WELCOME_MESSAGE])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
    }

    const updatedMessages = [...messagesRef.current, userMsg]
    messagesRef.current = updatedMessages
    setMessages(updatedMessages)
    setIsLoading(true)
    setEmotion('thinking')

    try {
      const profile = getProfile()

      // Build conversation history for API (exclude welcome message)
      const apiHistory = messagesRef.current
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiHistory,
          userProfile: profile
            ? {
                age: profile.age,
                income_bracket: profile.income_bracket,
                risk_profile: profile.risk_profile,
                goals: profile.goals,
                savings: profile.savings,
                is_unicredit_client: profile.is_unicredit_client,
              }
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: LLMResponse = await response.json()

      setEmotion(mapAvatarEmotion(data.avatar_emotion ?? 'happy'))

      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.reply,
        product: data.recommended_product,
        cta: data.product_cta ?? undefined,
        showDisclaimer: data.disclaimer_required,
      }

      const withAssistant = [...messagesRef.current, assistantMsg]
      messagesRef.current = withAssistant
      setMessages(withAssistant)

      if (data.gamification_event) {
        const { points_awarded, badge_unlocked } = data.gamification_event
        if (points_awarded > 0) addPoints(points_awarded)
        if (badge_unlocked) unlockBadge(badge_unlocked)
      }

      if (isFirstMessageRef.current) {
        isFirstMessageRef.current = false
        unlockBadge('chat_first')
        addPoints(10)
      }

      // Return emotion to listening after a few seconds
      setTimeout(() => setEmotion('listening'), 4000)
    } catch (err) {
      console.error('[useChat] error:', err)

      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou. Dacă problema persistă, încearcă să reîmprospătezi pagina.',
        showDisclaimer: false,
      }

      const withError = [...messagesRef.current, errorMsg]
      messagesRef.current = withError
      setMessages(withError)
      setEmotion('empathetic')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const clearMessages = useCallback(() => {
    messagesRef.current = [WELCOME_MESSAGE]
    setMessages([WELCOME_MESSAGE])
    setEmotion('idle')
    isFirstMessageRef.current = true
  }, [])

  return { messages, emotion, isLoading, sendMessage, clearMessages }
}
