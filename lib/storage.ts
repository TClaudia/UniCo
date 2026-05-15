import { UserProfile, ChatMessage } from '@/types'

const STORAGE_KEY = 'uc_user_profile'
const CONVERSATIONS_KEY = 'uc_conversations'
const MAX_CONVERSATIONS = 10

export interface StoredConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    const updated = { ...profile, updated_at: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // silent fail
  }
}

export function updateGamification(
  updates: Partial<UserProfile['gamification']>
): void {
  if (typeof window === 'undefined') return
  const profile = getProfile()
  if (!profile) return
  const updated: UserProfile = {
    ...profile,
    gamification: {
      ...profile.gamification,
      ...updates,
    },
    updated_at: new Date().toISOString(),
  }
  saveProfile(updated)
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silent fail
  }
}

export function getConversations(): StoredConversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredConversation[]
  } catch {
    return []
  }
}

export function saveConversation(conv: StoredConversation): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getConversations().filter(c => c.id !== conv.id)
    const updated = [conv, ...existing].slice(0, MAX_CONVERSATIONS)
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated))
  } catch {
    // silent fail
  }
}

export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const updated = getConversations().filter(c => c.id !== id)
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated))
  } catch {
    // silent fail
  }
}
