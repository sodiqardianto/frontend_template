"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Permission } from "@/features/permissions/types"
import { IconButton } from "@/components/shared/buttons"
import { SquarePenIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface GetColumnsProps {
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
}

export function getColumns({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Permission>[] {
  return [
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
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        const [resource, action] = name.split(":")
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {resource}
            </Badge>
            <span className="text-muted-foreground">:</span>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
              {action}
            </code>
          </div>
        )
      },
      meta: {
        label: "Name",
        variant: "text",
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "resource",
      accessorFn: (row) => row.name.split(":")[0],
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Resource" />
      ),
      cell: ({ row }) => {
        const resource = row.original.name.split(":")[0]
        return (
          <Badge variant="secondary" className="capitalize">
            {resource}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        const resource = row.original.name.split(":")[0]
        return value.includes(resource)
      },
      meta: {
        label: "Resource",
        variant: "select",
        options: [], // Will be populated dynamically
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: "action",
      accessorFn: (row) => row.name.split(":")[1],
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Action" />
      ),
      cell: ({ row }) => {
        const action = row.original.name.split(":")[1]
        return (
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
            {action}
          </code>
        )
      },
      meta: {
        label: "Action",
        variant: "text",
      },
      enableSorting: true,
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
    {
      id: "actions",
      size: 100,
      header: () => <div className="text-right text-muted-foreground">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<SquarePenIcon className="h-4 w-4" />}
            tooltip="Edit"
            className="text-yellow-500 bg-yellow-50 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 border-input"
            onClick={() => onEdit(row.original)}
          />
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            tooltip="Delete"
            className="text-destructive bg-destructive/10 hover:bg-destructive hover:text-white hover:border-destructive border-input"
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
