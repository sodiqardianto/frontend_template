import { create } from 'zustand'
import { Menu } from '../types'
import { getMenus } from '../api/menu-api'

interface MenuStore {
  menus: Menu[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchMenus: (force?: boolean) => Promise<void>
  setMenus: (menus: Menu[]) => void
  invalidate: () => void
  reset: () => void
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  menus: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  fetchMenus: async (force = false) => {
    if (get().hasFetched && !force) return
    set({ isLoading: true, error: null })
    try {
      const menus = await getMenus()
      set({ menus, isLoading: false, hasFetched: true, error: null })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, hasFetched: false })
    }
  },
  setMenus: (menus) => set({ menus }),
  invalidate: () => set({ hasFetched: false }),
  reset: () => set({ menus: [], isLoading: false, error: null, hasFetched: false }),
}))

