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
            render={({ field }) => {
              const allPermissionIds = availablePermissions.map(p => p.id)
              const isAllSelected = allPermissionIds.every(id => field.value?.includes(id))
              const isSomeSelected = allPermissionIds.some(id => field.value?.includes(id)) && !isAllSelected

              const handleSelectAll = () => {
                if (isAllSelected) {
                  field.onChange([])
                } else {
                  field.onChange(allPermissionIds)
                }
              }

              const handleSelectAllResource = (permissions: Permission[]) => {
                const resourceIds = permissions.map(p => p.id)
                const current = field.value || []
                const allResourceSelected = resourceIds.every(id => current.includes(id))
                
                if (allResourceSelected) {
                  field.onChange(current.filter(id => !resourceIds.includes(id)))
                } else {
                  const newIds = [...new Set([...current, ...resourceIds])]
                  field.onChange(newIds)
                }
              }

              return (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select permissions for this role
                      </FormDescription>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      disabled={isSubmitting}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border",
                        isAllSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : isSomeSelected
                            ? "bg-primary/50 text-primary-foreground border-primary/50"
                            : "bg-muted/50 text-muted-foreground border-gray-200 hover:bg-muted hover:border-border",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isAllSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-2xl p-4 bg-muted/30">
                    {Object.entries(groupedPermissions).map(([resource, permissions]) => {
                      const resourceIds = permissions.map(p => p.id)
                      const isResourceAllSelected = resourceIds.every(id => field.value?.includes(id))
                      const isResourceSomeSelected = resourceIds.some(id => field.value?.includes(id)) && !isResourceAllSelected

                      return (
                        <div key={resource} className="bg-background rounded-xl p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold capitalize text-primary">{resource}</h4>
                            <button
                              type="button"
                              onClick={() => handleSelectAllResource(permissions)}
                              disabled={isSubmitting}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer transition-all border",
                                isResourceAllSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : isResourceSomeSelected
                                    ? "bg-primary/50 text-primary-foreground border-primary/50"
                                    : "bg-muted/50 text-muted-foreground border-gray-200 hover:bg-muted hover:border-border",
                                isSubmitting && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {permissions.map((permission) => {
                              const isChecked = field.value?.includes(permission.id)
                              return (
                                <button
                                  key={permission.id}
                                  type="button"
                                  onClick={() => {
                                    const current = field.value || []
                                    if (isChecked) {
                                      field.onChange(current.filter((id) => id !== permission.id))
                                    } else {
                                      field.onChange([...current, permission.id])
                                    }
                                  }}
                                  disabled={isSubmitting}
                                  className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border",
                                    isChecked
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-muted/50 text-muted-foreground border-gray-200 hover:bg-muted hover:border-border",
                                    isSubmitting && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {permission.name.split(":")[1]}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )
            }}
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
