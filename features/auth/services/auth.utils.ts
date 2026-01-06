import { authService } from "./auth.service";

/**
 * Get current user from session storage
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userStr = sessionStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 * Note: This only checks if user info exists in session.
 * Actual token validation is done by the backend via httpOnly cookies.
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Logout user - clears cookies via API and session storage
 */
export async function logout(): Promise<void> {
  try {
    await authService.logout("");
  } catch {
    // Ignore errors - cookies will still be cleared by the server
  }

  // Clear session storage
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("user");
  }
}

/**
 * Clear local auth state (for use when receiving 401 from server)
 */
export function clearAuthState(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("user");
  }
}
