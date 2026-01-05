import { create } from 'zustand'
import { Menu } from '../types'
import { getMenus } from '../api/menu-api'

interface MenuStore {
  menus: Menu[]
  isLoading: boolean
  error: string | null
  fetchMenus: () => Promise<void>
}

export const useMenuStore = create<MenuStore>((set) => ({
  menus: [],
  isLoading: false,
  error: null,
  fetchMenus: async () => {
    set({ isLoading: true, error: null })
    try {
      const menus = await getMenus()
      set({ menus, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
