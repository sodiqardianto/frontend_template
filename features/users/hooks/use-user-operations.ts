import { useState } from "react"
import { toast } from "sonner"
import { createUser, updateUser, deleteUser, deleteUsers } from "../api/user-api"
import { useUserStore } from "../stores/use-user-store"
import { UserFormValues } from "../types"

export function useUserOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const fetchUsers = useUserStore((state) => state.fetchUsers)

  const create = async (data: UserFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await createUser(data)
      await fetchUsers(true)
      toast.success("User created successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create user")
    } finally {
      setIsProcessing(false)
    }
  }

  const update = async (id: string, data: UserFormValues, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await updateUser(id, data)
      await fetchUsers(true)
      toast.success("User updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update user")
    } finally {
      setIsProcessing(false)
    }
  }

  const remove = async (id: string, onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      await deleteUser(id)
      await fetchUsers(true)
      toast.success("User deleted successfully")
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete user")
    } finally {
      setIsProcessing(false)
    }
  }

  const bulkRemove = async (ids: string[], onSuccess?: () => void) => {
    setIsProcessing(true)
    try {
      const result = await deleteUsers(ids)
      await fetchUsers(true)
      toast.success(`${result.deletedCount} user(s) deleted successfully`)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete users")
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, create, update, remove, bulkRemove }
}

