import { useState } from "react"
import { toast } from "sonner"
import { createPermission, updatePermission, deletePermission } from "../api/permission-api"
import { usePermissionStore } from "../stores/use-permission-store"
import { PermissionFormValues } from "../types"

export function usePermissionOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const fetchPermissions = usePermissionStore((state) => state.fetchPermissions)

  const create = async (data: PermissionFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await createPermission(data)
      await fetchPermissions(true)
      toast.success("Permission created successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create permission")
    } finally {
      setIsProcessing(false)
    }
  }

  const update = async (id: string, data: PermissionFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await updatePermission(id, data)
      await fetchPermissions(true)
      toast.success("Permission updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update permission")
    } finally {
      setIsProcessing(false)
    }
  }

  const remove = async (id: string, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await deletePermission(id)
      await fetchPermissions(true)
      toast.success("Permission deleted successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete permission")
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, create, update, remove }
}
