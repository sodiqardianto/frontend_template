"use client";

import { ReactNode, useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormPasswordInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  showForgotPassword?: boolean;
  children?: ReactNode;
  required?: boolean;
}

/**
 * Reusable password input field with visibility toggle
 * Includes optional forgot password link and password strength slot
 */
export function FormPasswordInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Enter your password",
  disabled,
  showForgotPassword = false,
  children,
  required,
}: FormPasswordInputProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label} {required && <span className="text-destructive">*</span>}</FormLabel>
            {showForgotPassword && (
              <a
                href="#"
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </a>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "rounded-full pr-10",
                  fieldState.error && "border-destructive! focus-visible:ring-destructive!"
                )}
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
          {children}
        </FormItem>
      )}
    />
  );
}
