import { create } from 'zustand'
import { Role } from '../types'
import { getRoles } from '../api/role-api'

interface RoleStore {
  roles: Role[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchRoles: (force?: boolean) => Promise<void>
  invalidate: () => void
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchRoles: async (force = false) => {
    if (get().hasFetched && !force) {
      return
    }
    
    set({ isLoading: true, error: null })
    try {
      const roles = await getRoles()
      set({ roles, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  invalidate: () => {
    set({ hasFetched: false })
  },
}))
