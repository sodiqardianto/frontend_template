"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { MainButton } from "@/components/shared/buttons/main-button";
import { Form } from "@/components/ui/form";
import { FormInput, FormPasswordInput } from "@/components/shared/form-fields";
import { handleFormError } from "@/lib/api";

import { loginSchema, type LoginFormValues } from "../schemas";
import { authService } from "../services";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Get callback URL from cookie and clear it
   */
  const getCallbackUrl = (): string => {
    if (typeof document === "undefined") return "/admin";

    const cookies = document.cookie.split(";");
    const callbackCookie = cookies.find((c) => c.trim().startsWith("callbackUrl="));

    if (callbackCookie) {
      const callbackUrl = callbackCookie.split("=")[1];
      // Clear the cookie
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = "callbackUrl=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return decodeURIComponent(callbackUrl) || "/admin";
    }

    return "/admin";
  };

  const handleSubmit = async (data: LoginFormValues) => {
    setError("");

    try {
      const result = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Store user info for UI display (optional, not sensitive)
      // Tokens are now stored in httpOnly cookies by the backend
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user", JSON.stringify(result.data.user));
        // Store welcome message flag for toast on redirect
        sessionStorage.setItem("showWelcomeToast", result.data.user.name || "User");
      }

      // Callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        // Get callback URL from cookie (set by middleware when redirecting from protected route)
        const redirectUrl = getCallbackUrl();
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = redirectUrl;
      }
    } catch (err) {
      handleFormError(err, { form, onGeneralError: setError });
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-center text-xl font-semibold">
        Log in to your dashboard
      </h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email Field */}
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <FormPasswordInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              showForgotPassword
            />

            {/* Submit Button */}
            <MainButton
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            >
              {isSubmitting ? "Signing in..." : "Log in"}
            </MainButton>
          </form>
        </Form>
      </div>
    </div>
  );
}
