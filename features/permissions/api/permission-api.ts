import { api, apiClient } from "@/lib/api"
import { Permission, PermissionFormValues } from "../types"

interface PermissionResponse {
  data: Permission
}

interface PermissionsResponse {
  data: Permission[]
}

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await api.get<PermissionsResponse>("/permissions")
  return response.data
}

export const getPermission = async (id: string): Promise<Permission> => {
  const response = await api.get<PermissionResponse>(`/permissions/${id}`)
  return response.data
}

export const createPermission = async (data: PermissionFormValues): Promise<Permission> => {
  const response = await api.post<PermissionResponse>("/permissions", data)
  return response.data
}

export const updatePermission = async (id: string, data: PermissionFormValues): Promise<Permission> => {
  const response = await api.put<PermissionResponse>(`/permissions/${id}`, data)
  return response.data
}

export const deletePermission = async (id: string): Promise<void> => {
  await api.delete(`/permissions/${id}`)
}

interface BulkDeleteResponse {
  data: { deletedCount: number }
}

export const deletePermissions = async (ids: string[]): Promise<{ deletedCount: number }> => {
  const response = await apiClient<BulkDeleteResponse>("/permissions/bulk", {
    method: "DELETE",
    body: { ids },
  })
  return response.data
}
