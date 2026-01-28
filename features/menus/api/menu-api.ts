import { api } from "@/lib/api"
import { Menu, MenuFormValues } from "../types"

interface MenuResponse {
  data: Menu
}

interface MenusResponse {
  data: Menu[]
}

export const getMenus = async (): Promise<Menu[]> => {
  const response = await api.get<MenusResponse>("/menus")
  return response.data
}

export const createMenu = async (data: MenuFormValues): Promise<Menu> => {
  const response = await api.post<MenuResponse>("/menus", data)
  return response.data
}

export const updateMenu = async (id: string, data: MenuFormValues): Promise<Menu> => {
  const response = await api.put<MenuResponse>(`/menus/${id}`, data)
  return response.data
}

export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menus/${id}`)
}

export interface ReorderMenuItem {
  id: string
  parentId: string | null
  order: number
}

export const reorderMenus = async (items: ReorderMenuItem[]): Promise<void> => {
  await api.patch("/menus/reorder", { items })
}
