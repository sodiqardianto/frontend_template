import { Menu, MenuFormValues } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const MENU_API =
  `${API_BASE_URL ?? "http://localhost:3000/api"}/menus`;

export const getMenus = async (): Promise<Menu[]> => {
  const res = await fetch(MENU_API)
  if (!res.ok) throw new Error("Failed to fetch menus")
  const json = await res.json()
  return json.data
}

export const createMenu = async (data: MenuFormValues): Promise<Menu> => {
  const res = await fetch(MENU_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create menu")
  }
  const json = await res.json()
  return json.data
}

export const updateMenu = async (id: string, data: MenuFormValues): Promise<Menu> => {
  const res = await fetch(`${MENU_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update menu")
  }
  const json = await res.json()
  return json.data
}

export const deleteMenu = async (id: string): Promise<void> => {
  const res = await fetch(`${MENU_API}/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to delete menu")
  }
}
