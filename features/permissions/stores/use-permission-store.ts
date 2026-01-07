import { create } from 'zustand'
import { Permission } from '../types'
import { getPermissions } from '../api/permission-api'

interface PermissionStore {
  permissions: Permission[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchPermissions: (force?: boolean) => Promise<void>
  invalidate: () => void
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchPermissions: async (force = false) => {
    if (get().hasFetched && !force) {
      return
    }
    
    set({ isLoading: true, error: null })
    try {
      const permissions = await getPermissions()
      set({ permissions, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  invalidate: () => {
    set({ hasFetched: false })
  },
}))
