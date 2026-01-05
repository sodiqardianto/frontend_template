import { z } from "zod"

// Base schema
const baseSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  path: z
    .string()
    .min(1, "Path is required")
    .regex(/^\//, "Path must start with /")
    .max(200, "Path must be less than 200 characters"),
  icon: z.string().optional(),
  parentId: z
    .union([z.string(), z.null(), z.undefined()])
    .refine((val) => val !== undefined, { message: "Parent menu is required" })
    .transform((val) => val as string | null),
  // order - handled by backend automatically
  permission: z
    .string({ message: "Permission is required" })
    .min(1, "Permission is required"),
  isActive: z.boolean(),
})

// Refinement for conditional requirements
export const menuSchema = baseSchema.superRefine((data, ctx) => {
  // If no parentId (root menu), icon is required
  if (!data.parentId && (!data.icon || data.icon.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Icon is required for root menus",
      path: ["icon"],
    });
  }
});
