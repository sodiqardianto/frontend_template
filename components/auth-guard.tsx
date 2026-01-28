"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { clearAuthState } from "@/features/auth/services/auth.utils";

interface AuthGuardContextValue {
  isAuthenticated: boolean;
}

const AuthGuardContext = createContext<AuthGuardContextValue>({ isAuthenticated: false });

export const useAuthGuard = () => useContext(AuthGuardContext);

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Validates session with backend on mount
 * 
 * This component ensures that the user's session is valid by making
 * an API call to a protected endpoint. If the session is invalid,
 * it clears all auth state and redirects to login.
 * 
 * Also syncs user data to auth store for use across tabs.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "redirecting">("loading");
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      // Helper to clear session and redirect
      const clearAndRedirect = async () => {
        clearAuthState();

        // Call logout endpoint to clear httpOnly cookies from server
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          // Ignore logout errors
        }

        if (isMounted) {
          setStatus("redirecting");
        }
        window.location.href = "/login";
      };

      // Helper to fetch user data
      const fetchUser = async (): Promise<Response> => {
        return fetch(`${API_URL}/users/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      };

      // Helper to refresh token
      const refreshToken = async (): Promise<boolean> => {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          return response.ok;
        } catch {
          return false;
        }
      };

      // Helper to handle successful validation
      const handleSuccess = (userData: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = userData as { data: any };
        const user = data.data;

        // Sync user to store
        setUser(user);

        // Also sync to sessionStorage for backward compatibility
        if (typeof window !== "undefined") {
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        if (isMounted) {
          setStatus("authenticated");
        }
      };

      try {
        // First attempt to fetch user
        let response = await fetchUser();

        if (response.ok) {
          const userData = await response.json();
          handleSuccess(userData);
          return;
        }

        // If 401, try to refresh token and retry
        if (response.status === 401) {
          const refreshed = await refreshToken();

          if (refreshed) {
            // Retry fetching user after refresh
            response = await fetchUser();

            if (response.ok) {
              const userData = await response.json();
              handleSuccess(userData);
              return;
            }
          }
        }

        // Authentication failed - clear and redirect
        await clearAndRedirect();
      } catch {
        // Network error - clear and redirect
        await clearAndRedirect();
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  // Show loading state while validating
  if (status === "loading" || status === "redirecting") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuardContext.Provider value={{ isAuthenticated: true }}>
      {children}
    </AuthGuardContext.Provider>
  );
}
