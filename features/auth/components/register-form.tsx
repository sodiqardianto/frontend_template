"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, X } from "lucide-react";

import { MainButton } from "@/components/shared/buttons/main-button";
import { Form } from "@/components/ui/form";
import { FormInput, FormPasswordInput } from "@/components/shared/form-fields";
import { handleFormError } from "@/lib/api";

import { registerSchema, type RegisterFormValues } from "../schemas";
import { authService } from "../services";

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [error, setError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  // eslint-disable-next-line react-hooks/incompatible-library
  const password = form.watch("password");

  // Password strength validation
  const passwordStrength: PasswordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const handleSubmit = async (data: RegisterFormValues) => {
    setError("");

    try {
      const result = await authService.register({
        name: data.name,
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
        window.location.href = "/admin";
      }
    } catch (err) {
      handleFormError(err, { form, onGeneralError: setError });
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </div>
  );

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-center text-xl font-semibold">
        Create your account
      </h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
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

            {/* Name Field */}
            <FormInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              disabled={isSubmitting}
              maxLength={50}
              required
            />

            {/* Email Field */}
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              disabled={isSubmitting}
              required
            />

            {/* Password Field */}
            <FormPasswordInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="Create a password"
              disabled={isSubmitting}
              required
            >
              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                </div>
              )}
            </FormPasswordInput>

            {/* Confirm Password Field */}
            <FormPasswordInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              disabled={isSubmitting}
              required
            />

            {/* Submit Button */}
            <MainButton
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </MainButton>
          </form>
        </Form>
      </div>
    </div>
  );
}
