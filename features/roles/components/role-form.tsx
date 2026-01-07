"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { MainButton } from "@/components/shared/buttons/main-button"
import { FormInput } from "@/components/shared/form-fields"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { roleSchema } from "../schemas"
import { Role, RoleFormValues, Permission } from "../types"

interface RoleFormProps {
  initialData?: Role
  onSubmit: (data: RoleFormValues) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
  availablePermissions?: Permission[]
}

export function RoleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isProcessing,
  availablePermissions = []
}: RoleFormProps) {
  const isEditing = !!initialData
  
  // Get initial permission IDs from role
  const initialPermissionIds = initialData?.permissions?.map(rp => rp.permissionId) || []
  
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      permissionIds: initialPermissionIds,
    },
  })

  const handleSubmit = async (data: RoleFormValues) => {
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting

  // Group permissions by resource
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const [resource] = permission.name.split(":")
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

//   console.log(groupedPermissions);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <FormInput
          control={form.control}
          name="name"
          label="Name"
          placeholder="admin"
          disabled={isSubmitting}
          description="Lowercase, letters, numbers, and hyphens only"
          required
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Role description..."
                  disabled={isSubmitting}
                  className={cn(
                    "resize-none",
                    fieldState.error && "border-destructive! focus-visible:ring-destructive!"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Permissions */}
        {availablePermissions.length > 0 && (
          <FormField
            control={form.control}
            name="permissionIds"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Permissions</FormLabel>
                  <FormDescription>
                    Select permissions for this role
                  </FormDescription>
                </div>
                <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <div key={resource}>
                      <h4 className="text-sm font-medium capitalize mb-2">{resource}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <FormField
                            key={permission.id}
                            control={form.control}
                            name="permissionIds"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        field.onChange([...current, permission.id])
                                      } else {
                                        field.onChange(current.filter((id) => id !== permission.id))
                                      }
                                    }}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {permission.name.split(":")[1]}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <MainButton
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </MainButton>
          )}
          <MainButton
            type="submit"
            disabled={isProcessing}
            icon={isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          >
            {isEditing ? "Update" : "Create"} Role
          </MainButton>
        </div>
      </form>
    </Form>
  )
}
