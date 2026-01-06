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
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function getColumns({ onEdit, onDelete }: GetColumnsProps): ColumnDef<User>[] {
  return [
    {
      id: "select",
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
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Actions" className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<SquarePenIcon className="h-4 w-4" />}
            className="text-yellow-500 bg-yellow-50 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 border-input"
            onClick={() => onEdit(row.original)}
          />
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            className="text-destructive bg-destructive/10 hover:bg-destructive hover:text-white hover:border-destructive border-input"
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ]
}
