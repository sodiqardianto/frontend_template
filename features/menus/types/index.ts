export type MenuFormValues = {
  id?: string
  title: string
  path: string
  icon?: string
  parentId: string | null | undefined
  permission: string
  isActive: boolean
}

export type Menu = MenuFormValues & {
  id: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
  children?: Menu[] // Type for nested structure if needed
}
