"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { User } from "@/features/users/types"
import { IconButton } from "@/components/shared/buttons"
import { SquarePenIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface GetColumnsProps {
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

export function getColumns({ onEdit, onDelete }: GetColumnsProps): ColumnDef<User>[] {
  const showActions = onEdit || onDelete
  
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      size: 20,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      meta: {
        label: "Name",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
      meta: {
        label: "Email",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Roles" />
      ),
      cell: ({ row }) => {
        const roles = row.original.roles || []
        if (roles.length === 0) {
          return <span className="text-muted-foreground text-sm">No roles</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)))
      },
      meta: {
        label: "Status",
        variant: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | string | undefined
        if (!date) return "-"
        return format(new Date(date), "dd MMM yyyy HH:mm")
      },
      meta: {
        label: "Created At",
        variant: "date",
      },
      enableSorting: true,
      enableColumnFilter: false,
      enableHiding: true,
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      size: 100,
      header: () => <div className="text-right text-muted-foreground">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {onEdit && (
            <IconButton
              icon={<SquarePenIcon className="h-4 w-4" />}
              tooltip="Edit"
              className="text-yellow-500 bg-yellow-50 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 border-input"
              onClick={() => onEdit(row.original)}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              tooltip="Delete"
              className="text-destructive bg-destructive/10 hover:bg-destructive hover:text-white hover:border-destructive border-input"
              onClick={() => onDelete(row.original)}
            />
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  return columns
}
