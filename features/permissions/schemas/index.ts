import { z } from "zod"

export const permissionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-z]+(-[a-z]+)*:[a-z]+(-[a-z]+)*$/, "Name must be in format 'resource:action' (e.g., users:create, master-data:view)"),
})

export type PermissionSchemaType = z.infer<typeof permissionSchema>
