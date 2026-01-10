"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/features/auth/stores/use-auth-store"

/**
 * Hook for checking user permissions
 * 
 * @example
 * ```tsx
 * const { can, canAny, canAll } = usePermissions()
 * 
 * // Single permission check
 * const canCreateUser = can("users:create")
 * 
 * // canAny - returns true if user has AT LEAST ONE of the permissions
 * // Use case: Show section if user can do any related action
 * const canAccessUserSection = canAny("users:view", "users:create", "users:update")
 * const canViewReports = canAny("reports:sales", "reports:inventory", "reports:finance")
 * 
 * // canAll - returns true if user has ALL of the permissions
 * // Use case: Show feature that requires multiple permissions
 * const canApproveAndPublish = canAll("articles:approve", "articles:publish")
 * const canBulkDelete = canAll("users:view", "users:delete")
 * ```
 */
export function usePermissions() {
  const { user, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const permissions = user?.permissions || []

  const can = (permission: string) => permissions.includes(permission)
  const canAny = (...perms: string[]) => perms.some(p => permissions.includes(p))
  const canAll = (...perms: string[]) => perms.every(p => permissions.includes(p))

  return { permissions, can, canAny, canAll }
}
