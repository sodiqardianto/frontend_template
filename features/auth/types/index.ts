export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permissions: string[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: Tokens;
  };
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
}
