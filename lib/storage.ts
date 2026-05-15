import { UserProfile } from '@/types'

const STORAGE_KEY = 'uc_user_profile'

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
