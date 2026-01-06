import { api } from "@/lib/api";
import type { AuthResponse } from "../types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<{ data: { accessToken: string; refreshToken: string } }>(
      "/auth/refresh",
      { refreshToken }
    ),
};
