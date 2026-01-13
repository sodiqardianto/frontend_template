import { useState, useCallback } from "react"
import { getUsers, type GetUsersParams, type PaginatedResponse } from "../api/user-api"
import type { User } from "../types"

interface UseUsersQueryResult {
  data: User[]
  pagination: PaginatedResponse<User>["pagination"] | null
  isLoading: boolean
  error: string | null
  refetch: (params?: GetUsersParams) => Promise<void>
}

/**
 * Hook for fetching users with server-side pagination
 * Unlike the store, this hook fetches on demand with params
 */
export function useUsersQuery(): UseUsersQueryResult {
  const [data, setData] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<User>["pagination"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (params?: GetUsersParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getUsers(params)
      setData(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, pagination, isLoading, error, refetch }
}
