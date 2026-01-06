import { create } from 'zustand'
import { Menu } from '../types'
import { getMenus } from '../api/menu-api'

interface MenuStore {
  menus: Menu[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchMenus: (force?: boolean) => Promise<void>
  invalidate: () => void
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  menus: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchMenus: async (force = false) => {
    // Skip if already fetched and not forced
    if (get().hasFetched && !force) {
      return
    }
    
    set({ isLoading: true, error: null })
    try {
      const menus = await getMenus()
      set({ menus, isLoading: false, hasFetched: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  // Call this after create/update/delete to refresh data
  invalidate: () => {
    set({ hasFetched: false })
  },
}))

