import { useState } from "react"
import { toast } from "sonner"
import { createRole, updateRole, deleteRole, deleteRoles } from "../api/role-api"
import { useRoleStore } from "../stores/use-role-store"
import { RoleFormValues } from "../types"

export function useRoleOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const fetchRoles = useRoleStore((state) => state.fetchRoles)

  const create = async (data: RoleFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await createRole(data)
      await fetchRoles(true)
      toast.success("Role created successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create role")
    } finally {
      setIsProcessing(false)
    }
  }

  const update = async (id: string, data: RoleFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await updateRole(id, data)
      await fetchRoles(true)
      toast.success("Role updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update role")
    } finally {
      setIsProcessing(false)
    }
  }

  const remove = async (id: string, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await deleteRole(id)
      await fetchRoles(true)
      toast.success("Role deleted successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete role")
    } finally {
      setIsProcessing(false)
    }
  }

  const bulkRemove = async (ids: string[], onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      const result = await deleteRoles(ids)
      await fetchRoles(true)
      toast.success(`${result.deletedCount} role(s) deleted successfully`)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete roles")
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, create, update, remove, bulkRemove }
}

