export type UserFormValues = {
  id?: string
  email: string
  password?: string
  name: string
  isActive: boolean
}

export type User = {
  id: string
  email: string
  name: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}
