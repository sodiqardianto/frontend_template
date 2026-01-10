"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { MainButton } from "@/components/shared/buttons/main-button"
import { FormInput } from "@/components/shared/form-fields"

import { Form } from "@/components/ui/form"
import { permissionSchema } from "../schemas"
import { Permission, PermissionFormValues } from "../types"

interface PermissionFormProps {
  initialData?: Permission
  onSubmit: (data: PermissionFormValues) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
}

export function PermissionForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isProcessing 
}: PermissionFormProps) {
  const isEditing = !!initialData
  
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  })

  const handleSubmit = async (data: PermissionFormValues) => {
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <FormInput
          control={form.control}
          name="name"
          label="Name"
          placeholder="users:create"
          disabled={isSubmitting}
          description="Format: resource:action (e.g., users:create, master-data:view)"
          required
        />

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
            {isEditing ? "Update" : "Create"} Permission
          </MainButton>
        </div>
      </form>
    </Form>
  )
}
