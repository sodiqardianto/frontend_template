const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export class ApiException extends Error {
  constructor(
    public error: ApiError,
    public status: number
  ) {
    super(error.message);
    this.name = "ApiException";
  }

  get details() {
    return this.error.details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  _retry?: boolean;
};

// Track refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(success: boolean) {
  failedQueue.forEach((prom) => {
    prom.resolve(success);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // If already refreshing, wait for the result
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  
  try {
    const result = await refreshAccessToken();
    processQueue(result);
    return result;
  } catch (error) {
    processQueue(false);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiException(
      data.error || { code: "UNKNOWN", message: "Something went wrong" },
      response.status
    );
  }

  return data;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, _retry, ...rest } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - try to refresh token once (skip for auth endpoints)
  if (response.status === 401 && !_retry && !endpoint.includes("/auth/")) {
    const refreshed = await handleTokenRefresh();
    
    if (refreshed) {
      return apiClient<T>(endpoint, { ...options, _retry: true });
    }
    
    // Refresh failed - redirect to login
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    throw new ApiException(
      { code: "UNAUTHORIZED", message: "Session expired" },
      401
    );
  }

  return handleResponse<T>(response);
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
