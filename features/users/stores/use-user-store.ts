import { create } from 'zustand'
import { User } from '../types'
import { getUsers } from '../api/user-api'

interface UserStore {
  users: User[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchUsers: (force?: boolean) => Promise<void>
  invalidate: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchUsers: async (force = false) => {
    if (get().hasFetched && !force) {
      return
    }
    
    set({ isLoading: true, error: null })
    try {
      const users = await getUsers()
      set({ users, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  invalidate: () => {
    set({ hasFetched: false })
  },
}))
