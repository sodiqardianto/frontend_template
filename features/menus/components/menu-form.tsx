"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { MainButton } from "@/components/shared/buttons/main-button"
import { FormInput, FormCombobox } from "@/components/shared/form-fields"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { IconPicker } from "@/components/shared/icon-picker"
import { menuSchema } from "../schemas"
import { Menu, MenuFormValues } from "../types"

interface Permission {
  id: string
  name: string
}

interface MenuFormProps {
  initialData?: Menu
  onSubmit: (data: MenuFormValues) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
  availableMenus?: Menu[]
  availablePermissions?: Permission[]
  containerRef?: React.RefObject<HTMLElement | null>
}

export function MenuForm({ initialData, onSubmit, onCancel, isProcessing, availableMenus = [], availablePermissions = [], containerRef }: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      title: initialData?.title || "",
      path: initialData?.path || "",
      icon: initialData?.icon || "",
      parentId: initialData?.parentId,
      permission: initialData?.permission || undefined,
      isActive: initialData?.isActive ?? true,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const parentId = form.watch("parentId")
  const isRoot = parentId === null

  const handleSubmit = async (data: MenuFormValues) => {
    // Clear icon if not root level (has parent)
    if (data.parentId) {
      delete data.icon
    }
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting
  const filteredParentOptions = availableMenus.filter(m => m.id !== initialData?.id)

  // Parent menu options with "None" option for root level
  const parentMenuOptions = [
    { value: "none", label: "None (Root Level)" },
    ...filteredParentOptions.map((menu) => ({
      value: menu.id,
      label: menu.title,
    })),
  ]

  // Filter only "view" permissions for menu
  const permissionOptions = availablePermissions
    .filter((perm) => perm.name.endsWith(":view"))
    .map((perm) => ({
      value: perm.name,
      label: perm.name,
    }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title */}
        <FormInput
          control={form.control}
          name="title"
          label="Title"
          placeholder="Dashboard"
          disabled={isSubmitting}
          required
        />

        {/* Path */}
        <FormInput
          control={form.control}
          name="path"
          label="Path"
          placeholder="/admin/dashboard"
          disabled={isSubmitting}
          description="Must start with /"
          required
        />

        {/* Parent Menu & Permission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Parent Menu */}
          <FormCombobox
            control={form.control}
            name="parentId"
            label="Parent Menu"
            options={parentMenuOptions}
            placeholder="Select parent menu..."
            emptyMessage="No menus found."
            disabled={isSubmitting}
            required
            containerRef={containerRef}
            nullValue="none"
          />

          {/* Permission */}
          <FormCombobox
            control={form.control}
            name="permission"
            label="Permission"
            options={permissionOptions}
            placeholder="Select permission..."
            emptyMessage="No permissions found."
            disabled={isSubmitting}
            required
            containerRef={containerRef}
          />
        </div>

        {/* Icon - Show only if Root Level */}
        {isRoot && (
          <FormField
            control={form.control}
            name="icon"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Icon <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <IconPicker
                    value={field.value || ""}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Select an icon"
                    className={cn("rounded-full", fieldState.error && "border-destructive! ring-destructive!")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable or disable this menu item
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
            {initialData ? "Update" : "Create"} Menu
          </MainButton>
        </div>
      </form>
    </Form>
  )
}
