"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Role } from "@/features/roles/types"
import { IconButton } from "@/components/shared/buttons"
import { SquarePenIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface GetColumnsProps {
  onEdit?: (role: Role) => void
  onDelete?: (role: Role) => void
}

export function getColumns({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Role>[] {
  const showActions = onEdit || onDelete

  const columns: ColumnDef<Role>[] = [
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
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          {row.getValue("name")}
        </code>
      ),
      meta: {
        label: "Name",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("description") || "-"}
        </span>
      ),
      meta: {
        label: "Description",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Permissions" />
      ),
      cell: ({ row }) => {
        const permissions = row.original.permissions || []
        const displayCount = 3
        const remaining = permissions.length - displayCount

        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, displayCount).map((rp) => (
              <Badge key={rp.permissionId} variant="secondary" className="text-xs">
                {rp.permission.name}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remaining} more
              </Badge>
            )}
            {permissions.length === 0 && (
              <span className="text-muted-foreground text-sm">No permissions</span>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | undefined
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
