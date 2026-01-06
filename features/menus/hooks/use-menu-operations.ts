import { useState } from "react"
import { toast } from "sonner"
import { createMenu, updateMenu, deleteMenu } from "../api/menu-api"
import { useMenuStore } from "../stores/use-menu-store"
import { MenuFormValues } from "../types"

export function useMenuOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const fetchMenus = useMenuStore((state) => state.fetchMenus)

  const create = async (data: MenuFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await createMenu(data)
      await fetchMenus(true) // Force refresh
      toast.success("Menu created successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create menu")
    } finally {
      setIsProcessing(false)
    }
  }

  const update = async (id: string, data: MenuFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await updateMenu(id, data)
      await fetchMenus(true) // Force refresh
      toast.success("Menu updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update menu")
    } finally {
      setIsProcessing(false)
    }
  }

  const remove = async (id: string, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await deleteMenu(id)
      await fetchMenus(true) // Force refresh
      toast.success("Menu deleted successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete menu")
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, create, update, remove }
}
