import { api } from "@/lib/api"
import { User, UserFormValues } from "../types"

interface UserResponse {
  data: User
}

interface UsersResponse {
  data: User[]
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<UsersResponse>("/users")
  return response.data
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
