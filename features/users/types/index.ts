export type UserRole = {
  id: string
  name: string
  description: string | null
}

export type User = {
  id: string
  email: string
  name: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  roles: UserRole[]
}

export type UserFormValues = {
  id?: string
  email: string
  password?: string
  name: string
  isActive: boolean
  roleIds?: string[]
}
