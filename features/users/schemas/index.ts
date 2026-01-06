import { z } from "zod"

export const userSchema = z.object({
  id: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  isActive: z.boolean(),
})

// Schema for create (password required)
export const createUserSchema = userSchema.extend({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
})

// Schema for update (password optional)
export const updateUserSchema = userSchema
