"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { IconPicker } from "@/components/shared/icon-picker"
import { menuSchema } from "../schemas"
import { Menu, MenuFormValues } from "../types"

interface MenuFormProps {
  initialData?: Menu
  onSubmit: (data: MenuFormValues) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
  availableMenus?: Menu[]
}

// Permission format: resource:action
const AVAILABLE_PERMISSIONS = [
  { value: "dashboard:view", label: "Dashboard - View" },
  { value: "menus:view", label: "Menus - View" },
  { value: "users:view", label: "Users - View" },
  { value: "settings:view", label: "Settings - View" },
  { value: "reports:view", label: "Reports - View" },
]

export function MenuForm({ initialData, onSubmit, onCancel, isProcessing, availableMenus = [] }: MenuFormProps) {
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
    if (data.parentId === "none" || !data.parentId) {
       data.parentId = null
    }
    if (data.parentId) {
      data.icon = undefined
    }
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting
  const parentOptions = availableMenus.filter(m => m.id !== initialData?.id)

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
          <FormField
            control={form.control}
            name="parentId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Parent Menu <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  value={field.value === null ? "none" : field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className={cn("w-full rounded-full", fieldState.error && "border-destructive! ring-destructive!")}>
                      <SelectValue placeholder="Select parent menu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Root Level)</SelectItem>
                    {parentOptions.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Permission */}
          <FormField
            control={form.control}
            name="permission"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Permission <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className={cn("w-full rounded-full", fieldState.error && "border-destructive! ring-destructive!")}>
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <SelectItem key={perm.value} value={perm.value}>
                        {perm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
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
