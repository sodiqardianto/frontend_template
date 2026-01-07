"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { MainButton } from "@/components/shared/buttons/main-button"
import { FormInput, FormPasswordInput, FormMultiCombobox } from "@/components/shared/form-fields"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { createUserSchema, updateUserSchema } from "../schemas"
import { User, UserFormValues } from "../types"

interface Role {
  id: string
  name: string
  description?: string | null
}

interface UserFormProps {
  initialData?: User
  onSubmit: (data: UserFormValues) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
  availableRoles?: Role[]
  containerRef?: React.RefObject<HTMLElement | null>
}

export function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isProcessing,
  availableRoles = [],
  containerRef
}: UserFormProps) {
  const isEditing = !!initialData

  const initialRoleIds = initialData?.roles?.map(r => r.id) || []

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      isActive: initialData?.isActive ?? true,
      roleIds: initialRoleIds,
    },
  })

  const handleSubmit = async (data: UserFormValues) => {
    if (isEditing && !data.password) {
      delete data.password
    }
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting

  const roleOptions = availableRoles.map((role) => ({
    value: role.id,
    label: role.name,
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <FormInput
          control={form.control}
          name="name"
          label="Name"
          placeholder="John Doe"
          disabled={isSubmitting}
          required
        />

        {/* Email */}
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          disabled={isSubmitting}
          required
        />

        {/* Password */}
        <FormPasswordInput
          control={form.control}
          name="password"
          label="Password"
          placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
          disabled={isSubmitting}
          required={!isEditing}
        >
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Leave blank to keep current password
            </p>
          )}
        </FormPasswordInput>

        {/* Roles */}
        {availableRoles.length > 0 && (
          <FormMultiCombobox
            control={form.control}
            name="roleIds"
            label="Roles"
            options={roleOptions}
            placeholder="Select roles..."
            emptyMessage="No roles found."
            disabled={isSubmitting}
            description="Assign one or more roles to this user"
            containerRef={containerRef}
          />
        )}

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable or disable this user account
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  className="hover:cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
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
            {isEditing ? "Update" : "Create"} User
          </MainButton>
        </div>
      </form>
    </Form>
  )
}
