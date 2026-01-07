export type Permission = {
  id: string
  name: string
}

export type RolePermission = {
  roleId: string
  permissionId: string
  assignedAt: string
  permission: Permission
}

export type Role = {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
  permissions: RolePermission[]
}

export type RoleFormValues = {
  id?: string
  name: string
  description?: string
  permissionIds?: string[]
}
