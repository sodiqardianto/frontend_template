"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { MainButton } from "@/components/shared/buttons/main-button"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
      parentId: initialData?.parentId, // undefined default to show placeholder
      permission: initialData?.permission || undefined,
      isActive: initialData?.isActive ?? true,
    },
  })

  // Watch parentId to toggle Icon visibility and requirement
  // eslint-disable-next-line react-hooks/incompatible-library
  const parentId = form.watch("parentId")
  // Only show icon if explicitly Root (null). Hide if undefined (not selected) or string (submenu).
  const isRoot = parentId === null

  const handleSubmit = async (data: MenuFormValues) => {
    // Ensure parentId is null if string "none" or empty
    if (data.parentId === "none" || !data.parentId) {
       data.parentId = null
    }
    // If NOT root (submenu), clear icon value just in case
    if (data.parentId) {
      data.icon = undefined
    }
    await onSubmit(data)
  }

  const isSubmitting = form.formState.isSubmitting

  // Filter out self from parent options to avoid infinite recursion
  const parentOptions = availableMenus.filter(m => m.id !== initialData?.id)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Dashboard" 
                  {...field} 
                  disabled={isSubmitting} 
                  className={cn(fieldState.error && "border-destructive! focus-visible:ring-destructive!")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Path */}
        <FormField
          control={form.control}
          name="path"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Path <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="/admin/dashboard" 
                  {...field} 
                  disabled={isSubmitting} 
                  className={cn(fieldState.error && "border-destructive! focus-visible:ring-destructive!")}
                />
              </FormControl>
              <FormDescription className="text-xs">Must start with /</FormDescription>
              <FormMessage />
            </FormItem>
          )}
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
                    <SelectTrigger className={cn(fieldState.error && "border-destructive! ring-destructive!")}>
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
                    <SelectTrigger className={cn(fieldState.error && "border-destructive! ring-destructive!")}>
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
                    className={cn(fieldState.error && "border-destructive! ring-destructive!")}
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
