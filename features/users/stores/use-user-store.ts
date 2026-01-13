import { create } from "zustand"
import { User } from "../types"
import { getUsers } from "../api/user-api"

interface UserStore {
  users: User[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchUsers: (force?: boolean) => Promise<void>
  invalidate: () => void
}

/**
 * User store for client-side caching.
 * Note: For server-side pagination, use useUsersQuery hook instead.
 * This store fetches all users with a high limit for legacy compatibility.
 */
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
      // Fetch with high limit to get all users
      const response = await getUsers({ page: 1, limit: 1000 })
      set({ users: response.data, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  invalidate: () => {
    set({ hasFetched: false })
  },
}))

