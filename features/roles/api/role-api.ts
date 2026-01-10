import { api, apiClient } from "@/lib/api"
import { Role, RoleFormValues } from "../types"

interface RoleResponse {
  data: Role
}

interface RolesResponse {
  data: Role[]
}

interface BulkDeleteResponse {
  data: { deletedCount: number }
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<RolesResponse>("/roles")
  return response.data
}

export const getRole = async (id: string): Promise<Role> => {
  const response = await api.get<RoleResponse>(`/roles/${id}`)
  return response.data
}

export const createRole = async (data: RoleFormValues): Promise<Role> => {
  const response = await api.post<RoleResponse>("/roles", data)
  return response.data
}

export const updateRole = async (id: string, data: RoleFormValues): Promise<Role> => {
  const response = await api.put<RoleResponse>(`/roles/${id}`, data)
  return response.data
}

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`)
}

export const deleteRoles = async (ids: string[]): Promise<{ deletedCount: number }> => {
  const response = await apiClient<BulkDeleteResponse>("/roles/bulk", {
    method: "DELETE",
    body: { ids },
  })
  return response.data
}
