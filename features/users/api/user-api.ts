import { api, apiClient } from "@/lib/api"
import { User, UserFormValues } from "../types"

interface UserResponse {
  data: User
}

interface BulkDeleteResponse {
  data: { deletedCount: number }
}

/**
 * Paginated response from server
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Query params for getUsers
 */
export interface GetUsersParams {
  page?: number
  limit?: number
  sort?: string     // format: "field:asc" or "field:desc"
  search?: string
  isActive?: boolean
}

/**
 * Get users with server-side pagination
 */
export const getUsers = async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  if (params?.sort) searchParams.set("sort", params.sort)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())

  const query = searchParams.toString()
  const url = `/users${query ? `?${query}` : ""}`

  const response = await api.get<PaginatedResponse<User>>(url)
  return response
}

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<UserResponse>(`/users/${id}`)
  return response.data
}

export const createUser = async (data: UserFormValues): Promise<User> => {
  const response = await api.post<UserResponse>("/users", data)
  return response.data
}

export const updateUser = async (id: string, data: UserFormValues): Promise<User> => {
  const response = await api.put<UserResponse>(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}

export const deleteUsers = async (ids: string[]): Promise<{ deletedCount: number }> => {
  const response = await apiClient<BulkDeleteResponse>("/users/bulk", {
    method: "DELETE",
    body: { ids },
  })
  return response.data
}
