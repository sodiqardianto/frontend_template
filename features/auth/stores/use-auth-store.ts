import { create } from 'zustand'
import { User } from '../types'
import { getCurrentUser } from '../services/auth.utils'

interface AuthStore {
  user: User | null
  isLoading: boolean
  hasFetched: boolean
  loadUser: () => void
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  hasFetched: false,
  loadUser: () => {
    if (get().hasFetched) return
    
    set({ isLoading: true })
    const user = getCurrentUser()
    set({ user, isLoading: false, hasFetched: true })
  },
  setUser: (user) => {
    set({ user, hasFetched: true })
  },
  clearUser: () => {
    set({ user: null, hasFetched: false })
  },
}))
