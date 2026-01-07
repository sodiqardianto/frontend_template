import { z } from "zod"

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-z][a-z0-9-]*$/, "Name must be lowercase, start with letter, and contain only letters, numbers, and hyphens"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  permissionIds: z.array(z.string()).optional(),
})

export type RoleSchemaType = z.infer<typeof roleSchema>
