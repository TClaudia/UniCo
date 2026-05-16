'use client'

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatMessage, LLMResponse, AvatarEmotion } from '@/types'
import { getProfile } from '@/lib/storage'
import { saveConversation, StoredConversation } from '@/lib/storage'
import { addPoints, unlockBadge } from '@/lib/gamification'

interface UseChatReturn {
  messages: ChatMessage[]
  emotion: AvatarEmotion
  isLoading: boolean
  currentConversationId: string
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  loadConversation: (conv: StoredConversation) => void
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Bună ziua! Sunt consilierul tău financiar AI de la UniCredit. Sunt aici să te ajut cu întrebări despre economii, investiții, credite sau planificare financiară. Cu ce te pot ajuta astăzi?',
  showDisclaimer: false,
}

function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find(m => m.role === 'user')
  if (!first) return 'Conversație nouă'
  return first.content.length > 48
    ? first.content.slice(0, 48) + '…'
    : first.content
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [emotion, setEmotion] = useState<AvatarEmotion>('happy')
  const [isLoading, setIsLoading] = useState(false)
  const [convId, setConvId] = useState<string>(() => uuidv4())
  const isFirstMessageRef = useRef(true)
  const messagesRef = useRef<ChatMessage[]>([WELCOME_MESSAGE])
  const convIdRef = useRef<string>(convId)

  const persistConversation = useCallback((msgs: ChatMessage[], id: string) => {
    const userMessages = msgs.filter(m => m.id !== 'welcome' && m.role === 'user')
    if (userMessages.length === 0) return
    const conv: StoredConversation = {
      id,
      title: deriveTitle(msgs),
      messages: msgs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveConversation(conv)
  }, [])

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

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: LLMResponse = await response.json()

      setEmotion((data.avatar_emotion ?? 'happy') as AvatarEmotion)

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

      persistConversation(withAssistant, convIdRef.current)

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

      setTimeout(() => setEmotion('happy'), 4000)
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
      setEmotion('concerned')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, persistConversation])

  const clearMessages = useCallback(() => {
    const newId = uuidv4()
    convIdRef.current = newId
    setConvId(newId)
    messagesRef.current = [WELCOME_MESSAGE]
    setMessages([WELCOME_MESSAGE])
    setEmotion('happy')
    isFirstMessageRef.current = true
  }, [])

  const loadConversation = useCallback((conv: StoredConversation) => {
    convIdRef.current = conv.id
    setConvId(conv.id)
    messagesRef.current = conv.messages
    setMessages(conv.messages)
    setEmotion('happy')
    isFirstMessageRef.current = false
  }, [])

  return {
    messages,
    emotion,
    isLoading,
    currentConversationId: convId,
    sendMessage,
    clearMessages,
    loadConversation,
  }
}
